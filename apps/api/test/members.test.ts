import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { app } from "../app.js";
import { db } from "../db/client.js";
import { storedPasswordHash } from "./fixtures.js";

const PASSWORD = "correct horse battery";
const ADMIN = "members.admin@example.test";
const RESEARCHER = "members.researcher@example.test";
const OTHER = "members.other@example.test";
const CREATED = "members.created@example.test";

let admin = "";
let researcher = "";
let adminId = 0;
let researcherId = 0;
let otherId = 0;

async function insertMember(dni: string, email: string, roleCode: "administrator" | "researcher") {
  const { id } = await db
    .insertInto("member")
    .values({
      dni,
      email,
      passwordHash: await storedPasswordHash(PASSWORD),
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
    .returning("id")
    .executeTakeFirstOrThrow();
  return id;
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

const profile = {
  email: RESEARCHER,
  firstName: "Ana María",
  lastName: "Quispe",
  maternalName: "Mamani",
  birthDate: "1990-04-12",
  prefixCode: "dra",
  genderCode: "female",
  translations: { es: { bio: "Investigadora en visión." }, en: { bio: "Vision researcher." } },
} as const;

const emails = [ADMIN, RESEARCHER, OTHER, CREATED];

beforeAll(async () => {
  await db.deleteFrom("member").where("email", "in", emails).execute();
  adminId = await insertMember("41000001", ADMIN, "administrator");
  researcherId = await insertMember("41000002", RESEARCHER, "researcher");
  otherId = await insertMember("41000003", OTHER, "researcher");
  admin = await signIn(ADMIN);
  researcher = await signIn(RESEARCHER);
});

afterAll(async () => {
  await db.deleteFrom("member").where("email", "in", emails).execute();
});

describe("admin member writes", () => {
  const member = {
    email: CREATED,
    firstName: "Luis",
    lastName: "Rojas",
    maternalName: null,
    birthDate: null,
    prefixCode: null,
    genderCode: "male",
    isActive: 1,
    roleCode: "researcher",
    memberTypeCode: "phd_student",
    translations: { es: { bio: "Doctorando." }, en: { bio: "" } },
  } as const;

  test("a created member reads back with every locale's bio", async () => {
    const created = await send("POST", "/admin/members", { ...member, dni: "41000004", password: PASSWORD }, admin);
    expect(created.status).toBe(201);
    const { id } = (await created.json()) as { id: number };

    expect(await (await send("GET", `/admin/members/${id}`, undefined, admin)).json()).toMatchObject({
      id,
      dni: "41000004",
      ...member,
      photoUrl: expect.any(String),
    });

    const update = { ...member, isActive: 0, translations: { es: { bio: "" }, en: { bio: "PhD student." } } };
    expect((await send("PUT", `/admin/members/${id}`, update, admin)).status).toBe(200);
    expect(await (await send("GET", `/admin/members/${id}`, undefined, admin)).json()).toMatchObject(update);
  });

  test("a write missing a locale is refused", async () => {
    const res = await send("PUT", `/admin/members/${otherId}`, { ...member, translations: { es: { bio: "" } } }, admin);
    expect(res.status).toBe(400);
  });

  test("an update of an unknown member is not found", async () => {
    expect((await send("PUT", "/admin/members/999999", member, admin)).status).toBe(404);
  });

  test("a researcher cannot write another member", async () => {
    expect((await send("PUT", `/admin/members/${otherId}`, member, researcher)).status).toBe(403);
    expect((await send("GET", `/admin/members/${otherId}`, undefined, researcher)).status).toBe(403);
  });
});

describe("own profile", () => {
  test("a researcher updates their own profile in every locale", async () => {
    expect((await send("PUT", "/admin/account/profile", profile, researcher)).status).toBe(200);

    expect(await (await send("GET", "/admin/account/profile", undefined, researcher)).json()).toMatchObject({
      id: researcherId,
      ...profile,
      roleCode: "researcher",
      isActive: 1,
    });
  });

  test("a profile write cannot change the role or the active flag", async () => {
    const escalation = { ...profile, roleCode: "administrator", isActive: 0, memberTypeCode: "collaborator" };
    expect((await send("PUT", "/admin/account/profile", escalation, researcher)).status).toBe(200);

    const row = await db
      .selectFrom("member")
      .select(["roleCode", "isActive", "memberTypeCode"])
      .where("id", "=", researcherId)
      .executeTakeFirstOrThrow();
    expect(row).toEqual({ roleCode: "researcher", isActive: 1, memberTypeCode: "researcher" });
  });

  test("a researcher uploads their own photo", async () => {
    const before = (await (await send("GET", "/admin/account/profile", undefined, researcher)).json()) as {
      photoUrl: string;
    };
    const form = new FormData();
    form.set("file", new File([new Uint8Array([1, 2, 3])], "photo.png", { type: "image/png" }));

    const put = await app.request("/admin/account/profile/photo", {
      method: "PUT",
      headers: { cookie: researcher },
      body: form,
    });
    expect(put.status).toBe(200);

    const after = (await (await send("GET", "/admin/account/profile", undefined, researcher)).json()) as {
      photoUrl: string;
    };
    expect(after.photoUrl).not.toBe(before.photoUrl);
    const binding = await db
      .selectFrom("member_asset")
      .select("memberId")
      .where("memberId", "=", researcherId)
      .where("slot", "=", "photo")
      .executeTakeFirst();
    expect(binding).toEqual({ memberId: researcherId });
  });

  test("a researcher reads their own publishability but not another member's", async () => {
    const own = await send("GET", "/admin/account/profile/publishability", undefined, researcher);
    expect(own.status).toBe(200);
    expect(await own.json()).toMatchObject({ publishable: expect.any(Boolean) });

    expect((await send("GET", `/admin/members/${otherId}/publishability`, undefined, researcher)).status).toBe(403);
  });

  test("an active member without a bio is public and the administrator never is", async () => {
    const other = await send("GET", `/admin/members/${otherId}/publishability`, undefined, admin);
    expect(await other.json()).toEqual({ publishable: true, missing: [] });

    const own = await send("GET", "/admin/account/profile/publishability", undefined, admin);
    expect(await own.json()).toEqual({ publishable: false, missing: ["roleCode"] });

    const listed = (await (await send("GET", "/api/members")).json()) as Array<{ id: number; bio: string | null }>;
    expect(listed.find((member) => member.id === otherId)).toMatchObject({ bio: null });
    expect(listed.map((member) => member.id)).not.toContain(adminId);
  });

  test("a signed-out request cannot read or write a profile", async () => {
    expect((await send("GET", "/admin/account/profile")).status).toBe(401);
    expect((await send("PUT", "/admin/account/profile", profile)).status).toBe(401);
  });
});
