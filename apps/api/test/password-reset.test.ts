import { beforeEach, describe, expect, test } from "bun:test";

import { ErrorEnvelopeSchema } from "@gmcan/contracts/error";
import { Hono } from "hono";

import { app } from "../app.js";
import { db } from "../db/client.js";
import { AppError } from "../lib/errors/app-error.js";
import type { Mail, Mailer } from "../lib/mail.js";
import { onError } from "../middleware/error.js";
import { createEmailRouter } from "../routes/public/operational/email.js";
import { findMemberByResetToken, issueResetToken, sweepExpiredResets } from "../services/password-reset.service.js";
import { storedPasswordHash } from "./fixtures.js";

const EMAIL = "ana.torres@example.test";
const PASSWORD = "correct horse battery";
const NEW_PASSWORD = "a brand new password";

let memberId = 0;

async function insertMember(dni: string, email: string) {
  const result = await db
    .insertInto("member")
    .values({
      dni,
      email,
      passwordHash: await storedPasswordHash(PASSWORD),
      firstName: "Ana",
      lastName: "Torres",
      maternalName: null,
      birthDate: null,
      isActive: 1,
      roleCode: "researcher",
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
  memberId = await insertMember("20000001", EMAIL);
});

function post(path: string, body: object, headers: Record<string, string> = {}) {
  return app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const login = (password: string) => post("/admin/auth/login", { email: EMAIL, password });
const verify = (token: string) => post("/api/email/password-reset/verify", { token });
const confirm = (token: string, newPassword = NEW_PASSWORD) =>
  post("/api/email/password-reset/confirm", { token, newPassword });

describe("reset token", () => {
  test("only its digest is stored", async () => {
    const token = await issueResetToken(memberId);
    const rows = await db.selectFrom("password_reset").selectAll().execute();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.tokenHash).not.toBe(token);
    expect(JSON.stringify(rows)).not.toContain(token);
  });

  test("a new token replaces the previous one", async () => {
    const first = await issueResetToken(memberId);
    const second = await issueResetToken(memberId);
    expect((await verify(first)).status).toBe(400);
    expect((await verify(second)).status).toBe(200);
    expect(await db.selectFrom("password_reset").select("memberId").execute()).toHaveLength(1);
  });

  test("an unknown or expired token does not verify", async () => {
    expect((await verify("0".repeat(64))).status).toBe(400);
    const expired = await issueResetToken(memberId, new Date(Date.now() - 25 * 60 * 60 * 1000));
    expect((await verify(expired)).status).toBe(400);
    expect((await confirm(expired)).status).toBe(400);
    expect((await login(PASSWORD)).status).toBe(200);
  });

  test("the sweep removes expired tokens and keeps live ones", async () => {
    const other = await insertMember("20000002", "other@example.test");
    await issueResetToken(memberId, new Date(Date.now() - 25 * 60 * 60 * 1000));
    const live = await issueResetToken(other);
    await sweepExpiredResets();
    expect(await db.selectFrom("password_reset").select("memberId").execute()).toEqual([{ memberId: other }]);
    expect((await verify(live)).status).toBe(200);
  });
});

describe("confirming a reset", () => {
  test("sets the new password, spends the token and ends the member's sessions", async () => {
    const opened = await login(PASSWORD);
    const cookie = opened.headers.get("set-cookie")!.split(";")[0]!;
    expect((await app.request("/admin/account/me", { headers: { cookie } })).status).toBe(200);

    const token = await issueResetToken(memberId);
    const res = await confirm(token);
    expect(res.status).toBe(200);
    expect((await res.json()) as unknown).toEqual({ status: 1 });

    expect((await login(PASSWORD)).status).toBe(401);
    expect((await login(NEW_PASSWORD)).status).toBe(200);
    expect((await app.request("/admin/account/me", { headers: { cookie } })).status).toBe(401);
    expect((await verify(token)).status).toBe(400);
    expect((await confirm(token, "yet another password")).status).toBe(400);
  });

  test("two confirms racing on one token let exactly one set a password", async () => {
    const token = await issueResetToken(memberId);
    const statuses = (await Promise.all([confirm(token, "first password!"), confirm(token, "second password!")])).map(
      (res) => res.status,
    );
    expect(statuses.toSorted()).toEqual([200, 400]);

    const winner = statuses[0] === 200 ? "first password!" : "second password!";
    const loser = statuses[0] === 200 ? "second password!" : "first password!";
    expect((await login(winner)).status).toBe(200);
    expect((await login(loser)).status).toBe(401);
  });

  test("leaves other members' sessions and passwords alone", async () => {
    const other = await insertMember("20000002", "other@example.test");
    await db
      .insertInto("session")
      .values({
        id: "other-session",
        memberId: other,
        expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
        lastActiveAt: new Date().toISOString(),
      })
      .execute();
    await confirm(await issueResetToken(memberId));
    expect(await db.selectFrom("session").select("id").execute()).toEqual([{ id: "other-session" }]);
    const row = await db.selectFrom("member").select("passwordHash").where("id", "=", other).executeTakeFirstOrThrow();
    expect(row.passwordHash).not.toBe("");
  });

  test("a password under 8 characters is refused and the token survives", async () => {
    const token = await issueResetToken(memberId);
    expect((await confirm(token, "short")).status).toBe(400);
    expect((await verify(token)).status).toBe(200);
  });
});

describe("reset material never reaches a client", () => {
  const forbidden = ["resetToken", "resetExpiresAt", "tokenHash", "passwordHash"];

  test("login and the account view carry none of it", async () => {
    const token = await issueResetToken(memberId);
    const res = await login(PASSWORD);
    const cookie = res.headers.get("set-cookie")!.split(";")[0]!;
    const loginText = await res.text();
    const meText = await (await app.request("/admin/account/me", { headers: { cookie } })).text();

    for (const text of [loginText, meText]) {
      expect(text).not.toContain(token);
      for (const key of forbidden) expect(text).not.toContain(key);
    }
    expect(JSON.parse(loginText).user.email).toBe(EMAIL);
    expect(JSON.parse(meText).email).toBe(EMAIL);
  });
});

function recordingMailer(options: { fail?: boolean; gate?: Promise<void>; configured?: boolean } = {}) {
  const sent: Mail[] = [];
  const mailer: Mailer = {
    assertConfigured() {
      if (options.configured === false) throw new AppError("upstream_failure", "Email is not configured", 503);
    },
    async send(mail) {
      await options.gate;
      if (options.fail) throw new Error("mail service down");
      sent.push(mail);
    },
  };
  return { mailer, sent };
}

function emailApp(mailer: Mailer) {
  const queued: Promise<unknown>[] = [];
  const host = new Hono();
  host.onError(onError);
  host.route("/", createEmailRouter(mailer));
  const context = { waitUntil: (work: Promise<unknown>) => queued.push(work), passThroughOnException() {} };
  return {
    requestReset: (email: string) =>
      host.request(
        "/password-reset/request",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        },
        undefined,
        context as unknown as ExecutionContext,
      ),
    queued,
    settled: () => Promise.all(queued),
  };
}

describe("requesting a reset", () => {
  test("emails a working link to a member and never puts it in the response", async () => {
    const { mailer, sent } = recordingMailer();
    const { requestReset, settled } = emailApp(mailer);

    const res = await requestReset(EMAIL);
    await settled();

    expect(res.status).toBe(200);
    const body = await res.text();
    expect(JSON.parse(body)).toEqual({ status: 1 });
    expect(sent).toHaveLength(1);
    expect(sent[0]?.to).toEqual([EMAIL]);
    const token = /reset-password\?token=([0-9a-f]{64})/.exec(sent[0]?.html ?? "")?.[1];
    expect(token).toBeDefined();
    expect(body).not.toContain(token!);
    expect(await findMemberByResetToken(token!)).toEqual({ memberId });
  });

  test("answers an unknown address with the same status and body, and does nothing", async () => {
    const { mailer, sent } = recordingMailer();
    const { requestReset, settled } = emailApp(mailer);

    const known = await requestReset(EMAIL);
    const unknown = await requestReset("nobody@example.test");
    await settled();

    expect(unknown.status).toBe(known.status);
    expect(await unknown.text()).toBe(await known.text());
    expect(sent.map((mail) => mail.to)).toEqual([[EMAIL]]);
    expect(await db.selectFrom("password_reset").select("memberId").execute()).toEqual([{ memberId }]);
  });

  test("answers before the lookup and the send finish, so timing does not tell addresses apart", async () => {
    let open!: () => void;
    const { mailer, sent } = recordingMailer({ gate: new Promise<void>((resolve) => (open = resolve)) });
    const { requestReset, queued, settled } = emailApp(mailer);

    const res = await requestReset(EMAIL);
    expect(res.status).toBe(200);
    expect(queued).toHaveLength(1);
    expect(sent).toHaveLength(0);

    open();
    await settled();
    expect(sent).toHaveLength(1);
  });

  test("queues the same work for a known and an unknown address", async () => {
    const { mailer } = recordingMailer();
    const { requestReset, queued, settled } = emailApp(mailer);

    await requestReset(EMAIL);
    await requestReset("nobody@example.test");
    await settled();

    expect(queued).toHaveLength(2);
  });

  test("sends nothing to a deactivated member", async () => {
    await db.updateTable("member").set({ isActive: 0 }).where("id", "=", memberId).execute();
    const { mailer, sent } = recordingMailer();
    const { requestReset, settled } = emailApp(mailer);

    expect((await requestReset(EMAIL)).status).toBe(200);
    await settled();

    expect(sent).toHaveLength(0);
    expect(await db.selectFrom("password_reset").select("memberId").execute()).toEqual([]);
  });

  test("a failing mail service does not change the answer or reject the queued work", async () => {
    const { mailer } = recordingMailer({ fail: true });
    const { requestReset, settled } = emailApp(mailer);

    const res = await requestReset(EMAIL);
    expect(res.status).toBe(200);
    await expect(settled()).resolves.toBeDefined();
  });

  test("is refused with a 503 before any work when mail is not configured", async () => {
    const { mailer, sent } = recordingMailer({ configured: false });
    const { requestReset, queued } = emailApp(mailer);

    const responses = await Promise.all([EMAIL, "nobody@example.test"].map((email) => requestReset(email)));
    const bodies = await Promise.all(responses.map((res) => res.json()));
    expect(responses.map((res) => res.status)).toEqual([503, 503]);
    for (const body of bodies) expect(ErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    expect(queued).toHaveLength(0);
    expect(sent).toHaveLength(0);
    expect(await db.selectFrom("password_reset").select("memberId").execute()).toEqual([]);
  });
});
