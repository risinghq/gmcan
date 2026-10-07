import { env as workerEnv } from "cloudflare:workers";

import { env } from "../config/env.js";
import { AppError } from "./errors/app-error.js";

interface EmailBinding {
  send(message: { from: string; to: string[]; subject: string; html: string }): Promise<unknown>;
}

function notConfigured(): never {
  throw new AppError("upstream_failure", "Email is not configured", 503);
}

function emailBinding(): EmailBinding {
  const binding = (workerEnv as { EMAIL?: EmailBinding }).EMAIL;
  return binding ?? notConfigured();
}

/** Throws a 503 AppError unless email can be sent, so callers can refuse before changing any state. */
export function assertMailConfigured(): void {
  if (!env.EMAIL_FROM) notConfigured();
  emailBinding();
}

/** The address that receives membership requests. */
export function institutionalAddress(): string {
  return env.INSTITUTIONAL_EMAIL ?? notConfigured();
}

/** Sends one message through the Cloudflare email binding. Throws a 503 AppError while email is not configured. */
export async function sendMail(message: { to: string[]; subject: string; html: string }): Promise<void> {
  const from = env.EMAIL_FROM ?? notConfigured();
  await emailBinding().send({ from, ...message });
}
