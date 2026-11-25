import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import type { AdminNews, NewsTranslation, NewsWrite } from "@gmcan/contracts/admin";

import { app } from "../app.js";
import { db } from "../db/client.js";
import { storedPasswordHash } from "./fixtures.js";

const PASSWORD = "correct horse battery";
const ADMIN = "news.admin@example.test";
const SEEDED_AT = "2026-01-01T00:00:00.000Z";

let admin = "";
let authorId = 0;

function send(method: string, path: string, body?: unknown) {
  return app.request(path, {
    method,
    headers: { "content-type": "application/json", cookie: admin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function text(title: string): NewsTranslation {
  return { title, summary: `${title} summary`, body: `<p>${title} body</p>` };
}

function write(overrides: Partial<NewsWrite> = {}): NewsWrite {
  return {
    statusCode: "published",
    publishedAt: "2026-03-04",
    authorId,
    newsKindCode: "research",
    translations: { es: text("Noticia"), en: text("News") },
    ...overrides,
  };
}

async function create(body: NewsWrite): Promise<number> {
  const res = await send("POST", "/admin/news", body);
  expect(res.status).toBe(201);
  return ((await res.json()) as { id: number }).id;
}

async function read(id: number): Promise<AdminNews> {
  const res = await send("GET", `/admin/news/${id}`);
  expect(res.status).toBe(200);
  return (await res.json()) as AdminNews;
}

beforeAll(async () => {
  const member = await db
    .insertInto("member")
    .values({
      dni: "40000501",
      email: ADMIN,
      passwordHash: await storedPasswordHash(PASSWORD),
      firstName: "News",
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
  authorId = Number(member.insertId);

  const login = await app.request("/admin/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: ADMIN, password: PASSWORD }),
  });
  expect(login.status).toBe(200);
  admin = login.headers.get("set-cookie")!.split(";")[0]!;
});

afterAll(async () => {
  await db.deleteFrom("news").where("authorId", "=", authorId).execute();
  await db.deleteFrom("member").where("email", "=", ADMIN).execute();
});

describe("admin news", () => {
  test("a created item reads back with every locale", async () => {
    const body = write({ priority: 3 });
    const id = await create(body);

    const item = await read(id);
    expect(item).toMatchObject({
      id,
      statusCode: "published",
      publishedAt: body.publishedAt,
      priority: 3,
      authorId,
      newsKindCode: "research",
      translations: body.translations,
      asset: null,
    });
  });

  test("an update without a priority keeps the stored one", async () => {
    const id = await create(write({ priority: 5 }));
    const changed = write({ translations: { es: text("Cambiada"), en: text("Changed") } });

    expect((await send("PUT", `/admin/news/${id}`, changed)).status).toBe(200);

    const item = await read(id);
    expect(item.priority).toBe(5);
    expect(item.translations).toEqual(changed.translations);
  });

  test("refuses an item without every locale or with an empty title", async () => {
    const missing = await send("POST", "/admin/news", write({ translations: { es: text("Noticia") } }));
    expect(missing.status).toBe(400);

    const blank = await send(
      "POST",
      "/admin/news",
      write({ translations: { es: text("Noticia"), en: { ...text("News"), title: " " } } }),
    );
    expect(blank.status).toBe(400);
  });

  test("a draft is hidden from the public site until it is published", async () => {
    const id = await create(write({ statusCode: "draft" }));
    expect((await app.request(`/api/news/${id}`)).status).toBe(404);

    expect((await send("PUT", `/admin/news/${id}`, write())).status).toBe(200);
    const pub = await app.request(`/api/news/${id}`, { headers: { "accept-language": "en" } });
    expect(pub.status).toBe(200);
    expect(await pub.json()).toMatchObject({ id, title: "News" });
  });

  test("a deleted item is not found", async () => {
    const id = await create(write());

    expect((await send("DELETE", `/admin/news/${id}`)).status).toBe(200);
    expect((await send("GET", `/admin/news/${id}`)).status).toBe(404);
  });

  test("an anonymous request may not write", async () => {
    const res = await app.request("/admin/news", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(write()),
    });
    expect(res.status).toBe(401);
  });
});
