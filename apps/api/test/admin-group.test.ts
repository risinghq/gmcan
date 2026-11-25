import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import type { AdminAbout, AdminGroup, AboutTranslation, GroupTranslation } from "@gmcan/contracts/admin";

import { app } from "../app.js";
import { db } from "../db/client.js";
import { storedPasswordHash } from "./fixtures.js";

const PASSWORD = "correct horse battery";
const ADMIN = "group.admin@example.test";
const SEEDED_AT = "2026-01-01T00:00:00.000Z";

let admin = "";
let groupId = 0;
let aboutId = 0;

function send(method: string, path: string, body?: unknown) {
  return app.request(path, {
    method,
    headers: { "content-type": "application/json", cookie: admin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function adminGroup(): Promise<AdminGroup> {
  const res = await send("GET", "/admin/group");
  expect(res.status).toBe(200);
  const group = ((await res.json()) as AdminGroup[]).find((row) => row.id === groupId);
  expect(group).toBeDefined();
  return group!;
}

async function adminAbout(): Promise<AdminAbout> {
  const res = await send("GET", `/admin/group/${groupId}/about`);
  expect(res.status).toBe(200);
  const [about] = (await res.json()) as AdminAbout[];
  return about!;
}

function groupText(summary: string): GroupTranslation {
  return {
    summary,
    facilities: `${summary} labs`,
    futureWork: `<p>${summary} next</p>`,
    publicationsSection: `${summary} papers`,
    projectsSection: `${summary} projects`,
  };
}

function aboutText(description: string): AboutTranslation {
  return {
    description,
    objectivesContent: { introParagraphs: [`${description} aims`], items: ["one", "two"] },
    servicesContent: { introParagraphs: [], items: [`${description} service`] },
    homeServicesTeaserContent: { paragraphs: [`${description} teaser`] },
  };
}

beforeAll(async () => {
  await db
    .insertInto("member")
    .values({
      dni: "40000401",
      email: ADMIN,
      passwordHash: await storedPasswordHash(PASSWORD),
      firstName: "Group",
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
    .execute();
  const group = await db
    .insertInto("research_group")
    .values({ slug: "group-test", shortName: "GT", fullName: "Group Test", createdAt: SEEDED_AT, updatedAt: SEEDED_AT })
    .executeTakeFirstOrThrow();
  groupId = Number(group.insertId);
  const about = await db
    .insertInto("about")
    .values({ groupId, createdAt: SEEDED_AT, updatedAt: SEEDED_AT })
    .executeTakeFirstOrThrow();
  aboutId = Number(about.insertId);

  const login = await app.request("/admin/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: ADMIN, password: PASSWORD }),
  });
  expect(login.status).toBe(200);
  admin = login.headers.get("set-cookie")!.split(";")[0]!;
});

afterAll(async () => {
  await db.deleteFrom("research_group").where("id", "=", groupId).execute();
  await db.deleteFrom("member").where("email", "=", ADMIN).execute();
});

describe("admin group", () => {
  test("a saved group keeps every field in every locale", async () => {
    const body = {
      email: "lab@example.test",
      phone: "+51 1 555",
      translations: { es: groupText("Grupo"), en: groupText("Group") },
    };
    expect((await send("PUT", `/admin/group/${groupId}`, body)).status).toBe(200);

    const group = await adminGroup();
    expect({ email: group.email, phone: group.phone, translations: group.translations }).toEqual(body);
  });

  test("saving one section no longer erases the others", async () => {
    const first = { email: "", phone: "", translations: { es: groupText("Uno"), en: groupText("One") } };
    expect((await send("PUT", `/admin/group/${groupId}`, first)).status).toBe(200);
    const second = { ...first, translations: { ...first.translations, en: { ...groupText("One"), summary: "Two" } } };
    expect((await send("PUT", `/admin/group/${groupId}`, second)).status).toBe(200);

    expect((await adminGroup()).translations).toEqual(second.translations);
  });

  test("an optional section saved empty is hidden from the public site", async () => {
    const body = {
      email: "",
      phone: "",
      translations: { es: { ...groupText("Grupo"), futureWork: "  " }, en: groupText("Group") },
    };
    expect((await send("PUT", `/admin/group/${groupId}`, body)).status).toBe(200);

    const row = await db
      .selectFrom("research_group_translation")
      .select("futureWork")
      .where("groupId", "=", groupId)
      .where("locale", "=", "es")
      .executeTakeFirstOrThrow();
    expect(row.futureWork).toBeNull();
  });

  test("refuses a group without every locale or with an empty summary", async () => {
    const missing = await send("PUT", `/admin/group/${groupId}`, {
      email: "",
      phone: "",
      translations: { es: groupText("Grupo") },
    });
    expect(missing.status).toBe(400);

    const blank = await send("PUT", `/admin/group/${groupId}`, {
      email: "",
      phone: "",
      translations: { es: groupText("Grupo"), en: groupText(" ") },
    });
    expect(blank.status).toBe(400);
  });

  test("an unknown group is not found", async () => {
    const res = await send("PUT", "/admin/group/999999", {
      email: "",
      phone: "",
      translations: { es: groupText("Grupo"), en: groupText("Group") },
    });
    expect(res.status).toBe(404);
  });
});

describe("admin about", () => {
  test("a saved about page reads back in every locale and on the public site", async () => {
    const translations = { es: aboutText("Nosotros"), en: aboutText("About us") };
    expect((await send("PUT", `/admin/group/about/${aboutId}`, { translations })).status).toBe(200);

    expect((await adminAbout()).translations).toEqual(translations);
    const pub = await app.request(`/api/group/${groupId}/about`, { headers: { "accept-language": "en" } });
    expect(pub.status).toBe(200);
    const [page] = (await pub.json()) as AboutTranslation[];
    expect(page).toMatchObject(translations.en);
  });

  test("refuses an about page with an empty description", async () => {
    const res = await send("PUT", `/admin/group/about/${aboutId}`, {
      translations: { es: aboutText("Nosotros"), en: { ...aboutText("About"), description: "" } },
    });
    expect(res.status).toBe(400);
  });

  test("an unknown about page is not found", async () => {
    const res = await send("PUT", "/admin/group/about/999999", {
      translations: { es: aboutText("Nosotros"), en: aboutText("About") },
    });
    expect(res.status).toBe(404);
  });

  test("an anonymous request may not save", async () => {
    const res = await app.request(`/admin/group/about/${aboutId}`, { method: "PUT" });
    expect(res.status).toBe(401);
  });
});
