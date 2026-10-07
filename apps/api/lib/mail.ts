import { env } from "../config/env.js";
import { AppError } from "./errors/app-error.js";

const RESEND_URL = "https://api.resend.com/emails";

export interface Mail {
  to: string[];
  subject: string;
  html: string;
}

function notConfigured(): never {
  throw new AppError("upstream_failure", "Email is not configured", 503);
}

/** Throws a 503 AppError unless email can be sent, so callers can refuse before changing any state. */
export function assertMailConfigured(): void {
  if (!env.EMAIL_FROM || !env.RESEND_API_KEY) notConfigured();
}

/** The address that receives membership requests. */
export function institutionalAddress(): string {
  return env.INSTITUTIONAL_EMAIL ?? notConfigured();
}

/** Sends one message through Resend. `send` exists so a test can observe the request. */
export async function sendResend(
  config: { apiKey: string; from: string },
  mail: Mail,
  send: typeof fetch = fetch,
): Promise<void> {
  const response = await send(RESEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: config.from, ...mail }),
  });
  if (!response.ok) {
    console.error(`Resend rejected the message: ${response.status} ${await response.text()}`);
    throw new AppError("upstream_failure", "Email could not be sent", 502);
  }
}

/** Sends one message. Throws a 503 AppError while email is not configured. */
export async function sendMail(mail: Mail): Promise<void> {
  assertMailConfigured();
  await sendResend({ apiKey: env.RESEND_API_KEY as string, from: env.EMAIL_FROM as string }, mail);
}
