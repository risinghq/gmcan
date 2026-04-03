import type { Context, Next } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { db } from "../db/client.js";

const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours absolute
const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours idle

export async function createSession(c: Context, userDNI: string, userCorreo: string): Promise<void> {
  const id = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_MS);

  await db
    .insertInto("session")
    .values({ id, userDNI, userCorreo, expiresAt: expiresAt.toISOString(), lastActive: now.toISOString() })
    .execute();

  setCookie(c, "sid", id, {
    httpOnly: true,
    sameSite: "Strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function destroySession(c: Context): Promise<void> {
  const id = getCookie(c, "sid");
  if (id) {
    await db.deleteFrom("session").where("id", "=", id).execute();
  }
  deleteCookie(c, "sid", { path: "/" });
}

export const checkSession = async (c: Context, next: Next) => {
  const id = getCookie(c, "sid");
  if (!id) return c.json({ message: "Unauthorized" }, 401);

  const session = await db.selectFrom("session").selectAll().where("id", "=", id).executeTakeFirst();
  if (!session) return c.json({ message: "Unauthorized" }, 401);

  const now = new Date();

  if (new Date(session.expiresAt) < now) {
    await db.deleteFrom("session").where("id", "=", id).execute();
    return c.json({ message: "Session expired" }, 401);
  }

  if (new Date(session.lastActive).getTime() + IDLE_TIMEOUT_MS < now.getTime()) {
    await db.deleteFrom("session").where("id", "=", id).execute();
    return c.json({ message: "Session expired" }, 401);
  }

  await db.updateTable("session").set({ lastActive: now.toISOString() }).where("id", "=", id).execute();

  c.set("userCorreo", session.userCorreo);
  c.set("userDNI", session.userDNI);
  await next();
};
