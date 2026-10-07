import { beforeEach, describe, expect, test } from "bun:test";

import { sql } from "kysely";

import { db } from "../db/client.js";
import { sweepExpiredSessions } from "../middleware/session.js";
import { createNews, deleteNews, listAdminNews, listPublicNews, updateNews } from "../services/news.service.js";
import { globalSearch } from "../services/search.service.js";

type NewsInput = Parameters<typeof createNews>[0];

const ids: Record<"nano" | "time" | "congress", number> = { nano: 0, time: 0, congress: 0 };
const members: Record<"roberto" | "ana" | "lucia", number> = { roberto: 0, ana: 0, lucia: 0 };

async function insertMember(dni: string, firstName: string, lastName: string, maternalName: string | null) {
  const result = await db
    .insertInto("member")
    .values({
      dni,
      email: `${dni}@example.test`,
      passwordHash: "x",
      firstName,
      lastName,
      maternalName,
      birthDate: null,
      isActive: 1,
      passwordResetRequired: 0,
      roleCode: "researcher",
      memberTypeCode: "researcher",
      prefixCode: null,
      genderCode: null,
      resetToken: null,
      resetExpiresAt: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    })
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

function nanoInput(): NewsInput {
  return {
    statusCode: "published",
    publishedAt: "2026-03-01",
    authorId: members.roberto,
    newsKindCode: "research",
    translations: {
      es: { title: "Síntesis de nanomateriales", summary: "Resultados del laboratorio óptico", body: "zafiro" },
      en: { title: "Nanomaterial synthesis", summary: "Optical laboratory results", body: "sapphire" },
    },
  };
}

beforeEach(async () => {
  await db.deleteFrom("news").execute();
  await db.deleteFrom("member").execute();
  await db
    .updateTable("news_kind_translation")
    .set({ name: "Investigación" })
    .where("newsKindCode", "=", "research")
    .where("locale", "=", "es")
    .execute();

  members.roberto = await insertMember("10000001", "Roberto", "Sánchez", "Quispe");
  members.ana = await insertMember("10000002", "Ana", "Torres", null);
  members.lucia = await insertMember("10000003", "Lucía", "Mendoza", "Paredes");

  ids.nano = await createNews(nanoInput());
  ids.time = await createNews({
    statusCode: "published",
    publishedAt: "2026-02-01",
    authorId: members.ana,
    newsKindCode: "general",
    translations: {
      es: { title: "Gestión del tiempo", summary: "Consejos para estudiantes", body: "cuerpo" },
      en: { title: "Time management", summary: "Tips for students", body: "body" },
    },
  });
  ids.congress = await createNews({
    statusCode: "draft",
    publishedAt: "2026-01-01",
    authorId: members.ana,
    newsKindCode: "event",
    translations: {
      es: { title: "Congreso anual", summary: "Inscripciones abiertas", body: "cuerpo" },
      en: { title: "Annual congress", summary: "Registration open", body: "body" },
    },
  });
});

async function publicIds(q: string | undefined, locale = "es") {
  const res = await listPublicNews(locale, {
    q,
    sortBy: "publishedAt",
    sortOrder: "desc",
    page: 1,
    pageSize: 50,
  });
  return res.items.map((item) => item.id);
}

async function adminIds(q: string | undefined, locale = "es") {
  const res = await listAdminNews(locale, { q, sortBy: "publishedAt", sortOrder: "desc", page: 1, pageSize: 50 });
  return res.items.map((item) => item.id);
}

async function globalIds(q: string, locale = "es") {
  const res = await globalSearch(q, new Set(["news"]), locale);
  return res.news.map((item) => item.id);
}

async function countFtsRows(newsId?: number) {
  const where = newsId === undefined ? sql`` : sql`where newsId = ${newsId}`;
  const { rows } = await sql<{ n: number }>`select count(*) as n from news_fts ${where}`.execute(db);
  return Number(rows[0].n);
}

describe("news list search", () => {
  test("matches each typed word as a prefix, all words required", async () => {
    expect(await publicIds("sint")).toEqual([ids.nano]);
    expect(await publicIds("rob")).toEqual([ids.nano]);
    expect(await publicIds("rob sint")).toEqual([ids.nano]);
    expect(await publicIds("gest tiem")).toEqual([ids.time]);
    expect(await publicIds("gest laboratorio")).toEqual([]);
    expect(await publicIds("ntesis")).toEqual([]);
  });

  test("ignores accents and case", async () => {
    expect(await publicIds("sintesis")).toEqual([ids.nano]);
    expect(await publicIds("SÍNTESIS")).toEqual([ids.nano]);
    expect(await publicIds("GESTION")).toEqual([ids.time]);
    expect(await publicIds("lucia")).toEqual([]);
  });

  test.each([
    ["title", "nanomat", "nano"],
    ["summary", "consejos", "time"],
    ["author first name", "roberto", "nano"],
    ["author last name", "sanchez", "nano"],
    ["author maternal name", "quispe", "nano"],
    ["news kind name", "investigacion", "nano"],
  ] as const)("public and admin lists match the %s", async (_field, q, expected) => {
    expect(await publicIds(q)).toEqual([ids[expected]]);
    expect(await adminIds(q)).toEqual([ids[expected]]);
  });

  test("does not match the body", async () => {
    expect(await publicIds("zafiro")).toEqual([]);
    expect(await adminIds("zafiro")).toEqual([]);
  });

  test("matches only the requested locale", async () => {
    expect(await publicIds("management", "es")).toEqual([]);
    expect(await publicIds("management", "en")).toEqual([ids.time]);
    expect(await publicIds("research", "es")).toEqual([]);
    expect(await publicIds("research", "en")).toEqual([ids.nano]);
    expect(await publicIds("investigacion", "en")).toEqual([]);
    expect(await adminIds("evento", "es")).toEqual([ids.congress]);
    expect(await adminIds("evento", "en")).toEqual([]);
  });

  test("keeps filters, ordering, pagination, and total", async () => {
    const byAna = { q: "ana", sortBy: "publishedAt", sortOrder: "desc", pageSize: 1 } as const;
    const page1 = await listAdminNews("es", { ...byAna, page: 1 });
    const page2 = await listAdminNews("es", { ...byAna, page: 2 });
    expect(page2.total).toBe(2);
    expect(page1.total).toBe(2);
    expect(page1.items.map((i) => i.id)).toEqual([ids.time]);
    expect(page2.items.map((i) => i.id)).toEqual([ids.congress]);

    const byKind = await listAdminNews("es", {
      q: "ana",
      newsKindCode: "event",
      sortBy: "publishedAt",
      sortOrder: "desc",
      page: 1,
      pageSize: 10,
    });
    expect(byKind.total).toBe(1);
    expect(byKind.items.map((i) => i.id)).toEqual([ids.congress]);

    const published = await listPublicNews("es", {
      q: "ana",
      sortBy: "publishedAt",
      sortOrder: "desc",
      page: 1,
      pageSize: 10,
    });
    expect(published.total).toBe(1);
    expect(published.items.map((i) => i.id)).toEqual([ids.time]);
  });

  test.each(['"', "-", "*", '"-*()', "^:+", "  "])(
    "input %p with no usable word returns the unfiltered list",
    async (q) => {
      expect(await publicIds(q)).toEqual(await publicIds(undefined));
      expect(await adminIds(q)).toEqual(await adminIds(undefined));
    },
  );

  test.each([
    ['"rob', "nano"],
    ['rob"', "nano"],
    ["-rob", "nano"],
    ["rob*", "nano"],
    ["NEAR(rob", null],
    ["sint NEAR", null],
    ["sint:", "nano"],
    ["rob AND", null],
    ["OR", null],
    ["NOT", null],
  ] as const)("FTS syntax in %p is treated as plain words", async (q, expected) => {
    const want = expected ? [ids[expected]] : [];
    expect(await publicIds(q)).toEqual(want);
    expect(await adminIds(q)).toEqual(want);
  });
});

describe("global news search", () => {
  test("matches title and summary only, in the requested locale", async () => {
    expect(await globalIds("nanomat")).toEqual([ids.nano]);
    expect(await globalIds("sintesis")).toEqual([ids.nano]);
    expect(await globalIds("consejos")).toEqual([ids.time]);
    expect(await globalIds("congreso")).toEqual([]);
    expect(await globalIds("roberto")).toEqual([]);
    expect(await globalIds("investigacion")).toEqual([]);
    expect(await globalIds("management", "es")).toEqual([]);
    expect(await globalIds("management", "en")).toEqual([ids.time]);
  });

  test.each(['""', "--", "**"])("input %p with no usable word returns no news", async (q) => {
    expect(await globalIds(q)).toEqual([]);
  });

  test('"sint with a stray quote still matches', async () => {
    expect(await globalIds('"sint')).toEqual([ids.nano]);
  });
});

describe("index stays in sync with writes", () => {
  test("updating a news item reindexes its text, author, and kind", async () => {
    const input = nanoInput();
    input.translations.es.title = "Grafeno";
    input.authorId = members.lucia;
    input.newsKindCode = "general";
    await updateNews(ids.nano, input);

    expect(await publicIds("sint")).toEqual([]);
    expect(await publicIds("grafeno")).toEqual([ids.nano]);
    expect(await publicIds("roberto")).toEqual([]);
    expect(await publicIds("lucia")).toEqual([ids.nano]);
    expect(await publicIds("investigacion")).toEqual([]);
    expect(await publicIds("general")).toEqual([ids.nano, ids.time]);
  });

  test("updating one translation leaves the other locale's row intact", async () => {
    await db
      .updateTable("news_translation")
      .set({ summary: "Resumen nuevo" })
      .where("newsId", "=", ids.nano)
      .where("locale", "=", "es")
      .execute();
    expect(await publicIds("resumen", "es")).toEqual([ids.nano]);
    expect(await publicIds("optico", "es")).toEqual([]);
    expect(await publicIds("optical", "en")).toEqual([ids.nano]);
  });

  test("deleting a news item removes its index rows", async () => {
    await deleteNews(ids.time);
    expect(await publicIds("gestion")).toEqual([]);
    expect(await countFtsRows(ids.time)).toBe(0);
    expect(await countFtsRows(ids.nano)).toBe(2);
  });

  test("renaming a member reindexes the news they wrote", async () => {
    await db
      .updateTable("member")
      .set({ firstName: "Rodrigo", maternalName: "Huamán" })
      .where("id", "=", members.roberto)
      .execute();
    expect(await publicIds("roberto")).toEqual([]);
    expect(await publicIds("quispe")).toEqual([]);
    expect(await publicIds("rodrigo")).toEqual([ids.nano]);
    expect(await publicIds("huaman")).toEqual([ids.nano]);
    expect(await publicIds("rodrigo", "en")).toEqual([ids.nano]);
  });

  test("renaming a news kind reindexes that locale only", async () => {
    await db
      .updateTable("news_kind_translation")
      .set({ name: "Ciencia" })
      .where("newsKindCode", "=", "research")
      .where("locale", "=", "es")
      .execute();
    expect(await publicIds("investigacion", "es")).toEqual([]);
    expect(await publicIds("ciencia", "es")).toEqual([ids.nano]);
    expect(await publicIds("research", "en")).toEqual([ids.nano]);
  });
});

describe("session sweep", () => {
  test("deletes expired and idle sessions and keeps live ones", async () => {
    const hour = 3_600_000;
    const at = (offset: number) => new Date(Date.now() + offset).toISOString();
    const row = (id: string, expiresAt: string, lastActiveAt: string) => ({
      id,
      memberId: members.roberto,
      expiresAt,
      lastActiveAt,
    });
    await db
      .insertInto("session")
      .values([row("live", at(hour), at(0)), row("expired", at(-hour), at(0)), row("idle", at(hour), at(-3 * hour))])
      .execute();

    await sweepExpiredSessions();

    const remaining = await db.selectFrom("session").select("id").execute();
    expect(remaining.map((session) => session.id)).toEqual(["live"]);
  });
});
