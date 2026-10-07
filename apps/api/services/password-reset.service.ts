import { createHash } from "node:crypto";

import { sql } from "kysely";

import { getFrontendUrl } from "../config.js";
import { atomic, db } from "../db/client.js";
import { escapeHtml } from "../lib/html.js";
import type { Mail } from "../lib/mail.js";
import { getMemberByEmail, passwordChangeQueries } from "./member.service.js";

const RESET_LIFETIME_MS = 24 * 60 * 60 * 1000;

function randomToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** The token carries 256 random bits. A leaked digest cannot be turned back into a link. */
function digest(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Replaces any outstanding reset and returns the new token. Store only its
 * digest. The email is the only place that carries the plain token.
 */
export async function issueResetToken(memberId: number, now = new Date()): Promise<string> {
  const token = randomToken();
  await db
    .insertInto("password_reset")
    .values({
      tokenHash: digest(token),
      memberId,
      expiresAt: new Date(now.getTime() + RESET_LIFETIME_MS).toISOString(),
    })
    .onConflict((oc) =>
      oc.column("memberId").doUpdateSet((eb) => ({
        tokenHash: eb.ref("excluded.tokenHash"),
        expiresAt: eb.ref("excluded.expiresAt"),
      })),
    )
    .execute();
  return token;
}

/**
 * Email an active member and do nothing for any other address. Never throw.
 * Run after the response so known and unknown addresses are answered alike in time.
 */
export async function sendPasswordReset(email: string, send: (mail: Mail) => Promise<void>): Promise<void> {
  try {
    const member = await getMemberByEmail(email);
    if (!member || member.isActive !== 1) return;

    const token = await issueResetToken(member.id);
    const resetUrl = escapeHtml(`${getFrontendUrl()}/reset-password?token=${token}`);
    await send({
      to: [email],
      subject: "Password Reset - GMCAN",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Hello <strong>${escapeHtml(member.firstName)}</strong>,</p>
        <p>Click the link below to reset your password. This link expires in 24 hours.</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `,
    });
  } catch (error) {
    console.error("Password reset email failed", error);
  }
}

/** Returns the member a live token belongs to, or undefined for an unknown or expired token. */
export async function findMemberByResetToken(token: string, now = new Date()) {
  return db
    .selectFrom("password_reset")
    .select("memberId")
    .where("tokenHash", "=", digest(token))
    .where("expiresAt", ">", now.toISOString())
    .executeTakeFirst();
}

/**
 * Sets the new password, spends the token and ends the member's sessions in one batch.
 * Returns false when the token is unknown, expired or already spent.
 * Single-use: the batch re-checks the live token row, and spends it last, so of two concurrent
 * confirms the second finds no row and changes nothing.
 */
export async function resetPasswordWithToken(token: string, newPassword: string, now = new Date()): Promise<boolean> {
  const reset = await findMemberByResetToken(token, now);
  if (!reset) return false;
  const tokenHash = digest(token);
  const live = sql<boolean>`exists (
    select 1 from password_reset
    where tokenHash = ${tokenHash} and memberId = ${reset.memberId} and expiresAt > ${now.toISOString()}
  )`;
  const results = await atomic(await passwordChangeQueries(reset.memberId, newPassword, { guard: live }));
  return results[0]?.numAffectedRows === 1n;
}

export async function sweepExpiredResets(now = new Date()): Promise<void> {
  await db.deleteFrom("password_reset").where("expiresAt", "<", now.toISOString()).execute();
}
