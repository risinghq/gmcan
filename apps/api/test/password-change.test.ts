import { beforeEach, describe, expect, test } from "bun:test";

import { ErrorEnvelopeSchema } from "@gmcan/contracts/error";

import { app } from "../app.js";
import { db } from "../db/client.js";
import { hashPassword } from "../lib/password.js";
import { issueResetToken } from "../services/password-reset.service.js";

const PASSWORD = "correct horse battery";
const NEW_PASSWORD = "a brand new password";

const ADMIN = "admin@example.test";
const ANA = "ana.torres@example.test";
const LUIS = "luis.rojas@example.test";

async function insertMember(dni: string, email: string, roleCode: "administrator" | "researcher") {
  const result = await db
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
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

beforeEach(async () => {
  await db.deleteFrom("session").execute();
  await db.deleteFrom("news").execute();
  await db.deleteFrom("asset").execute();
  await db.deleteFrom("member").execute();
  await insertMember("30000001", ADMIN, "administrator");
  await insertMember("30000002", ANA, "researcher");
  await insertMember("30000003", LUIS, "researcher");
});

function send(method: string, path: string, body?: unknown, cookie?: string) {
  return app.request(path, {
    method,
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function signIn(email: string, password = PASSWORD) {
  const res = await send("POST", "/admin/auth/login", { email, password });
  expect(res.status).toBe(200);
  return res.headers.get("set-cookie")!.split(";")[0]!;
}

const isSignedIn = async (cookie: string) => (await send("GET", "/admin/account/me", undefined, cookie)).status === 200;

describe("a member changing their own password", () => {
  test("keeps the session that made the change and ends their others", async () => {
    const laptop = await signIn(ANA);
    const phone = await signIn(ANA);
    const someoneElse = await signIn(LUIS);

    const res = await send("PUT", "/admin/account/password", { password: NEW_PASSWORD }, laptop);
    expect(res.status).toBe(200);

    expect(await isSignedIn(laptop)).toBe(true);
    expect(await isSignedIn(phone)).toBe(false);
    expect(await isSignedIn(someoneElse)).toBe(true);
    expect((await send("POST", "/admin/auth/login", { email: ANA, password: PASSWORD })).status).toBe(401);
    expect((await send("POST", "/admin/auth/login", { email: ANA, password: NEW_PASSWORD })).status).toBe(200);
  });
});

describe("an administrator changing another member's password", () => {
  test("ends every session of that member and no one else's", async () => {
    const admin = await signIn(ADMIN);
    const laptop = await signIn(ANA);
    const phone = await signIn(ANA);
    const someoneElse = await signIn(LUIS);

    const res = await send("PUT", "/admin/email/member-password", { email: ANA, password: NEW_PASSWORD }, admin);
    expect(res.status).toBe(200);

    expect(await isSignedIn(laptop)).toBe(false);
    expect(await isSignedIn(phone)).toBe(false);
    expect(await isSignedIn(admin)).toBe(true);
    expect(await isSignedIn(someoneElse)).toBe(true);
    expect((await send("POST", "/admin/auth/login", { email: ANA, password: PASSWORD })).status).toBe(401);
    expect((await send("POST", "/admin/auth/login", { email: ANA, password: NEW_PASSWORD })).status).toBe(200);
  });

  test("keeps their own session when they change their own password this way", async () => {
    const here = await signIn(ADMIN);
    const elsewhere = await signIn(ADMIN);

    const res = await send("PUT", "/admin/email/member-password", { email: ADMIN, password: NEW_PASSWORD }, here);
    expect(res.status).toBe(200);

    expect(await isSignedIn(here)).toBe(true);
    expect(await isSignedIn(elsewhere)).toBe(false);
  });

  test("changes nothing for an unknown address", async () => {
    const admin = await signIn(ADMIN);
    const ana = await signIn(ANA);

    const res = await send(
      "PUT",
      "/admin/email/member-password",
      { email: "nobody@example.test", password: "x" },
      admin,
    );
    expect(res.status).toBe(404);
    expect(ErrorEnvelopeSchema.safeParse(await res.json()).success).toBe(true);
    expect(await isSignedIn(ana)).toBe(true);
  });
});

describe("a password change while a reset link is outstanding", () => {
  const post = (path: string, body: unknown) => send("POST", path, body);
  const outstanding = async (memberId: number) =>
    db.selectFrom("password_reset").select("memberId").where("memberId", "=", memberId).execute();
  const idOf = async (email: string) =>
    (await db.selectFrom("member").select("id").where("email", "=", email).executeTakeFirstOrThrow()).id;

  test("a member changing their own password spends the link", async () => {
    const ana = await idOf(ANA);
    const luis = await idOf(LUIS);
    const token = await issueResetToken(ana);
    await issueResetToken(luis);
    const cookie = await signIn(ANA);

    expect((await send("PUT", "/admin/account/password", { password: NEW_PASSWORD }, cookie)).status).toBe(200);

    expect(await outstanding(ana)).toEqual([]);
    expect(await outstanding(luis)).toHaveLength(1);
    expect((await post("/api/email/password-reset/verify", { token })).status).toBe(400);
    const confirm = await post("/api/email/password-reset/confirm", { token, newPassword: "an attacker password" });
    expect(confirm.status).toBe(400);
    expect((await send("POST", "/admin/auth/login", { email: ANA, password: NEW_PASSWORD })).status).toBe(200);
  });

  test("an administrator setting the password spends the link", async () => {
    const ana = await idOf(ANA);
    const token = await issueResetToken(ana);
    const admin = await signIn(ADMIN);

    const res = await send("PUT", "/admin/email/member-password", { email: ANA, password: NEW_PASSWORD }, admin);
    expect(res.status).toBe(200);

    expect(await outstanding(ana)).toEqual([]);
    expect(
      (await post("/api/email/password-reset/confirm", { token, newPassword: "an attacker password" })).status,
    ).toBe(400);
    expect((await send("POST", "/admin/auth/login", { email: ANA, password: NEW_PASSWORD })).status).toBe(200);
  });
});

describe("the retired reset flag", () => {
  test("is not a column of member, and its route is gone", async () => {
    const row = await db.selectFrom("member").selectAll().executeTakeFirstOrThrow();
    expect(Object.keys(row)).not.toContain("passwordResetRequired");

    const cookie = await signIn(ANA);
    const res = await send("GET", "/admin/account/reset-status", undefined, cookie);
    expect(res.status).toBe(404);
    expect(ErrorEnvelopeSchema.safeParse(await res.json()).success).toBe(true);
  });
});
