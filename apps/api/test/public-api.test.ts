import { beforeEach, describe, expect, test } from "bun:test";

import { app } from "../app.js";
import { db } from "../db/client.js";
import { createNews } from "../services/news.service.js";
import { storedPasswordHash } from "./fixtures.js";

const DNI = "20000001";
const EMAIL = "ana.torres@example.test";
const BIRTH_DATE = "1990-04-05";
const PASSWORD = "correct horse battery";

let memberId = 0;
const newsIds = { published: 0, draft: 0, archived: 0 };

async function insertMember(values: { dni: string; email: string; isActive: number }) {
  const result = await db
    .insertInto("member")
    .values({
      ...values,
      passwordHash: await storedPasswordHash(PASSWORD),
      firstName: "Ana",
      lastName: "Torres",
      maternalName: null,
      birthDate: BIRTH_DATE,
      roleCode: "researcher",
      memberTypeCode: "researcher",
      prefixCode: null,
      genderCode: "female",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    })
    .executeTakeFirstOrThrow();
  const id = Number(result.insertId);
  await db
    .insertInto("member_translation")
    .values([
      { memberId: id, locale: "es", bio: "Investigadora" },
      { memberId: id, locale: "en", bio: "Researcher" },
    ])
    .execute();
  return id;
}

function newsInput(statusCode: "published" | "draft" | "archived", title: string) {
  return {
    statusCode,
    publishedAt: "2026-03-01",
    authorId: memberId,
    newsKindCode: "general" as const,
    translations: {
      es: { title, summary: "resumen", body: "cuerpo" },
      en: { title, summary: "summary", body: "body" },
    },
  };
}

beforeEach(async () => {
  await db.deleteFrom("session").execute();
  await db.deleteFrom("news").execute();
  await db.deleteFrom("member").execute();

  memberId = await insertMember({ dni: DNI, email: EMAIL, isActive: 1 });
  newsIds.published = await createNews(newsInput("published", "Noticia publica"));
  newsIds.draft = await createNews(newsInput("draft", "Noticia borrador"));
  newsIds.archived = await createNews(newsInput("archived", "Noticia archivada"));
});

async function getJson(path: string) {
  const res = await app.request(path);
  return { status: res.status, text: await res.clone().text(), body: (await res.json()) as any };
}

describe("public news", () => {
  test("the list returns only published items, whatever status is asked for", async () => {
    const responses = await Promise.all(
      ["?statusCode=draft", "?statusCode=archived", "?statusCode=published", ""].map((query) =>
        getJson(`/api/news${query}`),
      ),
    );
    for (const { body } of responses) {
      expect(body.items.map((item: { id: number }) => item.id)).toEqual([newsIds.published]);
      expect(body.total).toBe(1);
    }
  });

  test("the detail of an unpublished item is not found", async () => {
    expect((await getJson(`/api/news/${newsIds.published}`)).status).toBe(200);
    expect((await getJson(`/api/news/${newsIds.draft}`)).status).toBe(404);
    expect((await getJson(`/api/news/${newsIds.archived}`)).status).toBe(404);
  });

  test("global search does not find unpublished items", async () => {
    const { body } = await getJson("/api/search?q=Noticia&types=news");
    expect(body.news.map((item: { id: number }) => item.id)).toEqual([newsIds.published]);
  });
});

describe("public members", () => {
  const personal = [DNI, EMAIL, BIRTH_DATE];

  test("the list and the profile carry no personal data", async () => {
    const list = await getJson("/api/members");
    expect(list.body.map((m: { id: number }) => m.id)).toEqual([memberId]);
    const profile = await getJson(`/api/members/${memberId}`);
    expect(profile.status).toBe(200);
    expect(profile.body.member.firstName).toBe("Ana");

    for (const { text, body } of [list, profile]) {
      for (const value of personal) expect(text).not.toContain(value);
      const member = Array.isArray(body) ? body[0] : body.member;
      for (const key of ["dni", "email", "birthDate", "genderCode"]) expect(member).not.toHaveProperty(key);
    }
  });

  test("global search returns no personal data and does not match on email", async () => {
    const byName = await getJson("/api/search?q=Torres&types=members");
    expect(byName.body.members.map((m: { id: number }) => m.id)).toEqual([memberId]);
    for (const value of personal) expect(byName.text).not.toContain(value);

    const byEmail = await getJson("/api/search?q=ana.torres&types=members");
    expect(byEmail.body.members).toEqual([]);
  });
});

function login(email: string, password: string) {
  return app.request("/admin/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

describe("login", () => {
  test("an active member signs in", async () => {
    const res = await login(EMAIL, PASSWORD);
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("sid=");
  });

  test("an inactive member with the right password does not sign in", async () => {
    await insertMember({ dni: "20000002", email: "gone@example.test", isActive: 0 });
    const res = await login("gone@example.test", PASSWORD);
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
    expect(await db.selectFrom("session").selectAll().execute()).toEqual([]);
  });

  test("a session opened before deactivation stops working", async () => {
    const res = await login(EMAIL, PASSWORD);
    const cookie = res.headers.get("set-cookie")!.split(";")[0];
    const before = await app.request("/admin/account/me", { headers: { cookie } });
    expect(before.status).toBe(200);

    await db.updateTable("member").set({ isActive: 0 }).where("id", "=", memberId).execute();
    const after = await app.request("/admin/account/me", { headers: { cookie } });
    expect(after.status).toBe(401);
    expect(await db.selectFrom("session").selectAll().execute()).toEqual([]);

    await db.updateTable("member").set({ isActive: 1 }).where("id", "=", memberId).execute();
    const reactivated = await app.request("/admin/account/me", { headers: { cookie } });
    expect(reactivated.status).toBe(401);
  });
});

async function adminCookie() {
  await db.updateTable("member").set({ roleCode: "administrator" }).where("id", "=", memberId).execute();
  const res = await login(EMAIL, PASSWORD);
  return res.headers.get("set-cookie")!.split(";")[0];
}

function sendMember(method: string, path: string, cookie: string, body: object) {
  return app.request(path, {
    method,
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify(body),
  });
}

function newMember(isActive: number) {
  return {
    dni: "20000009",
    email: "new@example.test",
    password: "another long password",
    firstName: "Nuevo",
    lastName: "Miembro",
    isActive,
    roleCode: "researcher",
    memberTypeCode: "researcher",
  };
}

describe("member status", () => {
  test("creating a member with a status other than 0 or 1 is a validation error", async () => {
    const cookie = await adminCookie();
    const rejected = await Promise.all(
      [2, 3, -1].map((isActive) => sendMember("POST", "/admin/members", cookie, newMember(isActive))),
    );
    expect(rejected.map((res) => res.status)).toEqual([400, 400, 400]);

    const created = await sendMember("POST", "/admin/members", cookie, newMember(0));
    expect(created.status).toBe(201);
  });

  test("updating a member to a status other than 0 or 1 is a validation error", async () => {
    const cookie = await adminCookie();
    const res = await sendMember("PATCH", `/admin/members/${memberId}`, cookie, { isActive: 3 });
    expect(res.status).toBe(400);
  });
});
