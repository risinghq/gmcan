import { randomUUID } from "node:crypto";

import type { Context, Next } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { env } from "../config/env.js";
import { db } from "../db/client.js";
import { AUTH_EXEMPT_PATHS } from "./auth-exempt.js";

declare module "hono" {
  interface ContextVariableMap {
    memberId: number;
    email: string;
  }
}

const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;
const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000;

export async function createSession(c: Context, memberId: number): Promise<void> {
  const id = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_MS);

  await db
    .insertInto("session")
    .values({ id, memberId, expiresAt: expiresAt.toISOString(), lastActiveAt: now.toISOString() })
    .execute();

  setCookie(c, "sid", id, {
    httpOnly: true,
    sameSite: "Strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
    secure: env.NODE_ENV === "production",
  });
}

/** Deletes sessions past their absolute expiry or idle timeout. */
export async function sweepExpiredSessions(now = new Date()): Promise<void> {
  await db
    .deleteFrom("session")
    .where((eb) =>
      eb.or([
        eb("expiresAt", "<", now.toISOString()),
        eb("lastActiveAt", "<", new Date(now.getTime() - IDLE_TIMEOUT_MS).toISOString()),
      ]),
    )
    .execute();
}

export async function destroySession(c: Context): Promise<void> {
  const id = getCookie(c, "sid");
  if (id) {
    await db.deleteFrom("session").where("id", "=", id).execute();
  }
  deleteCookie(c, "sid", { path: "/" });
}

export const requireSession = async (c: Context, next: Next) => {
  if (AUTH_EXEMPT_PATHS.has(c.req.path)) return next();

  const id = getCookie(c, "sid");
  if (!id) return c.json({ error: "Unauthorized" }, 401);

  const session = await db.selectFrom("session").selectAll().where("id", "=", id).executeTakeFirst();
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const now = new Date();

  if (new Date(session.expiresAt) < now) {
    await db.deleteFrom("session").where("id", "=", id).execute();
    return c.json({ error: "Session expired" }, 401);
  }

  if (new Date(session.lastActiveAt).getTime() + IDLE_TIMEOUT_MS < now.getTime()) {
    await db.deleteFrom("session").where("id", "=", id).execute();
    return c.json({ error: "Session expired" }, 401);
  }

  await db.updateTable("session").set({ lastActiveAt: now.toISOString() }).where("id", "=", id).execute();

  const member = await db
    .selectFrom("member")
    .select(["email", "isActive"])
    .where("id", "=", session.memberId)
    .executeTakeFirst();
  if (!member || member.isActive !== 1) {
    await db.deleteFrom("session").where("id", "=", id).execute();
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("memberId", session.memberId);
  c.set("email", member.email);
  await next();
};
