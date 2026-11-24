import { beforeAll, beforeEach, describe, expect, test } from "bun:test";

import { app } from "../app.js";
import { db } from "../db/client.js";
import { hashPassword } from "../lib/password.js";

const PASSWORD = "correct horse battery";
const ADMIN = "refs.admin@example.test";
const RESEARCHER = "refs.researcher@example.test";

let admin = "";
let researcher = "";

async function insertMember(dni: string, email: string, roleCode: "administrator" | "researcher") {
  await db
    .insertInto("member")
    .values({
      dni,
      email,
      passwordHash: await hashPassword(PASSWORD),
      firstName: "Test",
      lastName: "Member",
      maternalName: null,
      birthDate: null,
      isActive: 1,
      roleCode,
      memberTypeCode: "researcher",
      prefixCode: null,
      genderCode: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    })
    .execute();
}

function send(method: string, path: string, body?: unknown, cookie?: string) {
  return app.request(path, {
    method,
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function signIn(email: string) {
  const res = await send("POST", "/admin/auth/login", { email, password: PASSWORD });
  expect(res.status).toBe(200);
  return res.headers.get("set-cookie")!.split(";")[0]!;
}

async function listRef<T>(path: string) {
  return (await (await send("GET", `/admin/ref/${path}`, undefined, admin)).json()) as T[];
}

beforeAll(async () => {
  await db.deleteFrom("member").where("email", "in", [ADMIN, RESEARCHER]).execute();
  await insertMember("40000001", ADMIN, "administrator");
  await insertMember("40000002", RESEARCHER, "researcher");
  admin = await signIn(ADMIN);
  researcher = await signIn(RESEARCHER);
});

beforeEach(async () => {
  await db.deleteFrom("event").execute();
  await db.deleteFrom("university").execute();
  await db.deleteFrom("journal").execute();
});

describe("events", () => {
  const translations = {
    es: { name: "Congreso Andino", city: "Lima", country: "Perú" },
    en: { name: "Andean Congress", city: null, country: "Peru" },
  };

  test("an event created in the admin reads back in each locale and publicly", async () => {
    const created = await send("POST", "/admin/events", { translations }, admin);
    expect(created.status).toBe(201);
    const { id } = (await created.json()) as { id: number };

    const detail = await send("GET", `/admin/events/${id}`, undefined, admin);
    expect(await detail.json()).toEqual({
      id,
      translations: {
        es: { name: "Congreso Andino", city: "Lima", country: "Perú" },
        en: { name: "Andean Congress", country: "Peru" },
      },
    });

    expect(await (await send("GET", "/admin/events", undefined, admin)).json()).toEqual([
      { id, name: "Congreso Andino", city: "Lima", country: "Perú" },
    ]);
    expect(await (await app.request("/api/events")).json()).toEqual([
      { id, name: "Congreso Andino", city: "Lima", country: "Perú" },
    ]);
    expect(await (await app.request(`/api/events/${id}`)).json()).toEqual({
      id,
      name: "Congreso Andino",
      city: "Lima",
      country: "Perú",
    });
  });

  test("an update replaces the translations and a delete removes the event", async () => {
    const { id } = (await (await send("POST", "/admin/events", { translations }, admin)).json()) as { id: number };
    const renamed = { ...translations, es: { name: "Congreso Andino 2027", city: "Cusco", country: "Perú" } };

    const updated = await send("PUT", `/admin/events/${id}`, { translations: renamed }, admin);
    expect(await updated.json()).toEqual({ status: 1 });
    expect(await (await app.request(`/api/events/${id}`)).json()).toMatchObject({ name: "Congreso Andino 2027" });

    expect(await (await send("DELETE", `/admin/events/${id}`, undefined, admin)).json()).toEqual({ status: 1 });
    expect((await app.request(`/api/events/${id}`)).status).toBe(404);
    expect((await send("GET", `/admin/events/${id}`, undefined, admin)).status).toBe(404);
  });

  test("a researcher cannot write events", async () => {
    expect((await send("POST", "/admin/events", { translations }, researcher)).status).toBe(403);
  });
});

describe("reference data", () => {
  test("the seeded lookups list in the admin", async () => {
    const plain = await Promise.all(["gender", "role", "funding-source", "currency"].map((path) => listRef(path)));
    for (const rows of plain) expect(rows.length).toBeGreaterThan(0);

    const translated = await Promise.all(
      ["member-type", "publication-kind", "thesis-kind", "news-kind"].map((path) =>
        listRef<{ code: string; translations: Record<string, unknown> }>(path),
      ),
    );
    for (const rows of translated) {
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) expect(Object.keys(row.translations).toSorted()).toEqual(["en", "es"]);
    }

    const memberTypes = translated[0]!;
    expect(memberTypes.find((row) => row.code === "researcher")!.translations.es).toEqual({
      name: expect.any(String),
      nameSingular: expect.any(String),
    });
  });

  test("a journal goes through create, read, update and delete", async () => {
    const created = await send("POST", "/admin/ref/journal", { name: "Revista Andina" }, admin);
    expect(created.status).toBe(201);
    const { id } = (await created.json()) as { id: number };

    expect(await (await send("GET", `/admin/ref/journal/${id}`, undefined, admin)).json()).toMatchObject({
      id,
      name: "Revista Andina",
    });
    expect((await send("PUT", `/admin/ref/journal/${id}`, { name: "Revista" }, admin)).status).toBe(200);
    expect(await (await send("GET", "/admin/ref/journal", undefined, admin)).json()).toEqual([
      expect.objectContaining({ id, name: "Revista" }),
    ]);
    expect(await (await send("GET", `/admin/ref/journal/${id}/dependencies`, undefined, admin)).json()).toEqual({
      total: 0,
      byKind: { journalArticle: 0, conferencePaper: 0, thesis: 0 },
      canDelete: true,
    });
    expect((await send("DELETE", `/admin/ref/journal/${id}`, undefined, admin)).status).toBe(200);
    expect((await send("GET", `/admin/ref/journal/${id}`, undefined, admin)).status).toBe(404);
  });

  test("a university goes through create, read, update and delete", async () => {
    const translations = { es: { name: "Universidad de Lima" }, en: { name: "University of Lima" } };
    const created = await send("POST", "/admin/ref/university", { translations }, admin);
    expect(created.status).toBe(201);
    const { id } = (await created.json()) as { id: number };

    expect(await (await send("GET", `/admin/ref/university/${id}`, undefined, admin)).json()).toEqual({
      id,
      translations,
    });

    const renamed = { ...translations, es: { name: "U. de Lima" } };
    expect((await send("PUT", `/admin/ref/university/${id}`, { translations: renamed }, admin)).status).toBe(200);
    expect(await (await send("GET", "/admin/ref/university", undefined, admin)).json()).toEqual([
      { id, translations: renamed },
    ]);

    expect((await send("DELETE", `/admin/ref/university/${id}`, undefined, admin)).status).toBe(200);
    expect((await send("GET", `/admin/ref/university/${id}`, undefined, admin)).status).toBe(404);
  });

  test("a researcher cannot read or write reference data", async () => {
    expect((await send("GET", "/admin/ref/gender", undefined, researcher)).status).toBe(403);
    expect((await send("POST", "/admin/ref/journal", { name: "X" }, researcher)).status).toBe(403);
  });
});
