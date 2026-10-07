import { describe, expect, test } from "bun:test";

import { app } from "../app.js";
import { atomic, db, readBatch } from "../db/client.js";
import { countQueries, countRoundTrips } from "./query-counter.js";

describe("readBatch", () => {
  test("sends its reads as one D1 call and keeps each query's rows apart", async () => {
    let results: readonly unknown[] = [];
    const trips = await countRoundTrips(async () => {
      results = await readBatch([
        db.selectFrom("locale").select("code").orderBy("code"),
        db.selectFrom("locale").select("code").where("code", "=", "en"),
        db.selectFrom("locale").select("code").where("code", "=", "zz"),
      ]);
    });
    expect(trips).toBe(1);
    expect(results).toEqual([[{ code: "en" }, { code: "es" }], [{ code: "en" }], []]);
  });

  test("a failing statement rejects its own batch", async () => {
    const batch = readBatch([
      db.selectFrom("locale").select("code"),
      db.selectFrom("no_such_table" as never).selectAll(),
    ]);
    await expect(batch).rejects.toThrow();
  });
});

describe("reads of one request", () => {
  test("reads that are not batched stay separate calls", async () => {
    const trips = await countRoundTrips(async () => {
      await Promise.all([
        db.selectFrom("locale").select("code").execute(),
        db.selectFrom("locale").select("code").execute(),
      ]);
    });
    expect(trips).toBe(2);
  });

  test("/api/lookup reads its twelve lists in one call", async () => {
    let status = 0;
    const statements = await countQueries(async () => {
      status = (await app.request("/api/lookup")).status;
    });
    const trips = await countRoundTrips(async () => {
      await app.request("/api/lookup");
    });
    expect(status).toBe(200);
    expect(statements).toBeGreaterThan(1);
    expect(trips).toBe(1);
  });
});

describe("concurrent requests", () => {
  test("each request pays for its own D1 call and shares nothing", async () => {
    const trips = await countRoundTrips(async () => {
      await Promise.all([app.request("/api/lookup"), app.request("/api/lookup"), app.request("/api/lookup")]);
    });
    expect(trips).toBe(3);
  });

  test("a failing read in one request does not reject another request", async () => {
    const failing = async () => {
      await readBatch([db.selectFrom("no_such_table" as never).selectAll()]);
      return new Response("unreachable");
    };
    const [first, failed, second] = await Promise.allSettled([
      app.request("/api/lookup"),
      failing(),
      app.request("/api/lookup"),
    ]);
    expect(failed.status).toBe("rejected");
    expect(first.status).toBe("fulfilled");
    expect(second.status).toBe("fulfilled");
    if (first.status === "fulfilled" && second.status === "fulfilled") {
      expect(first.value.status).toBe(200);
      expect(second.value.status).toBe(200);
      expect(await first.value.json()).toEqual(await second.value.json());
    }
  });

  test("a failing plain select does not reject a select issued in the same tick elsewhere", async () => {
    const [good, bad] = await Promise.allSettled([
      db.selectFrom("locale").select("code").execute(),
      db
        .selectFrom("no_such_table" as never)
        .selectAll()
        .execute(),
    ]);
    expect(good.status).toBe("fulfilled");
    expect(bad.status).toBe("rejected");
  });
});

describe("atomic", () => {
  test("stays one call", async () => {
    const trips = await countRoundTrips(() =>
      atomic([db.selectFrom("locale").select("code"), db.selectFrom("locale").select("code")]),
    );
    expect(trips).toBe(1);
  });
});
