import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import type { AdminPublication, PublicationWrite } from "@gmcan/contracts/admin";

import { app } from "../app.js";
import { db } from "../db/client.js";
import { storedPasswordHash } from "./fixtures.js";

const PASSWORD = "correct horse battery";
const ADMIN = "publications.admin@example.test";
const SEEDED_AT = "2026-01-01T00:00:00.000Z";

let admin = "";
let adminId = 0;
let eventId = 0;
let universityId = 0;

function send(method: string, path: string, body?: unknown) {
  return app.request(path, {
    method,
    headers: { "content-type": "application/json", cookie: admin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function paper(overrides: Partial<PublicationWrite> = {}): PublicationWrite {
  return {
    publishedAt: "2026-05-01",
    doi: "10.1000/paper",
    subtype: { kindCode: "conference_paper", conferencePaper: { eventId } },
    translations: {
      es: { title: "Ponencia", abstract: "Resumen" },
      en: { title: "Paper", abstract: "Abstract" },
    },
    authors: [
      { kind: "registered", memberId: adminId, authorOrder: 1 },
      { kind: "external", externalName: "Ana Torres", authorOrder: 2 },
    ],
    ...overrides,
  };
}

async function create(body: PublicationWrite): Promise<number> {
  const res = await send("POST", "/admin/publications", body);
  expect(res.status).toBe(201);
  return ((await res.json()) as { id: number }).id;
}

async function read(id: number): Promise<AdminPublication> {
  const res = await send("GET", `/admin/publications/${id}`);
  expect(res.status).toBe(200);
  return (await res.json()) as AdminPublication;
}

beforeAll(async () => {
  const member = await db
    .insertInto("member")
    .values({
      dni: "40000701",
      email: ADMIN,
      passwordHash: await storedPasswordHash(PASSWORD),
      firstName: "Publications",
      lastName: "Admin",
      maternalName: null,
      birthDate: null,
      isActive: 1,
      roleCode: "administrator",
      memberTypeCode: "researcher",
      prefixCode: null,
      genderCode: null,
      createdAt: SEEDED_AT,
      updatedAt: SEEDED_AT,
    })
    .executeTakeFirstOrThrow();
  adminId = Number(member.insertId);
  eventId = Number((await db.insertInto("event").defaultValues().executeTakeFirstOrThrow()).insertId);
  universityId = Number((await db.insertInto("university").defaultValues().executeTakeFirstOrThrow()).insertId);

  const login = await app.request("/admin/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: ADMIN, password: PASSWORD }),
  });
  expect(login.status).toBe(200);
  admin = login.headers.get("set-cookie")!.split(";")[0]!;
});

// Test files share one database: drop the rows that hold restrict references to the event and university.
afterAll(async () => {
  const authored = db.selectFrom("publication_author").select("publicationId").where("memberId", "=", adminId);
  await db.deleteFrom("publication").where("id", "in", authored).execute();
  await db.deleteFrom("event").where("id", "=", eventId).execute();
  await db.deleteFrom("university").where("id", "=", universityId).execute();
  await db.deleteFrom("member").where("id", "=", adminId).execute();
});

describe("admin publications", () => {
  test("a created conference paper reads back with every locale and its byline in order", async () => {
    const body = paper();
    const id = await create(body);

    expect(await read(id)).toMatchObject({ id, ...body, asset: null });
  });

  test("a thesis keeps its university and kind", async () => {
    const subtype = { kindCode: "thesis", thesis: { universityId, thesisKindCode: "masters" } } as const;
    const id = await create(paper({ subtype, doi: undefined }));

    const publication = await read(id);
    expect(publication.subtype).toEqual(subtype);
    expect(publication.doi).toBeUndefined();
  });

  test("an update replaces the translations, subtype and byline", async () => {
    const id = await create(paper());
    const next = paper({
      subtype: { kindCode: "journal_article", journalArticle: { issue: 4 } },
      translations: { es: { title: "Artículo" }, en: { title: "Article" } },
      authors: [{ kind: "external", externalName: "Luis Rojas", authorOrder: 1 }],
    });

    expect((await send("PUT", `/admin/publications/${id}`, next)).status).toBe(200);

    const publication = await read(id);
    expect(publication.subtype).toEqual(next.subtype);
    expect(publication.translations).toEqual(next.translations);
    expect(publication.authors).toEqual(next.authors);
  });

  test("refuses a byline that starts at order 0", async () => {
    const res = await send(
      "POST",
      "/admin/publications",
      paper({ authors: [{ kind: "external", externalName: "Ana Torres", authorOrder: 0 }] }),
    );
    expect(res.status).toBe(400);
  });

  test("refuses a publication without authors", async () => {
    expect((await send("POST", "/admin/publications", paper({ authors: [] }))).status).toBe(400);
  });

  test("answers 404 for a missing publication", async () => {
    expect((await send("GET", "/admin/publications/999999")).status).toBe(404);
  });
});
