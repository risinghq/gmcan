import { env as workerEnv } from "cloudflare:workers";
import { z } from "zod";

const required = (what: string) => z.string(`${what} is required`).min(1, `${what} must not be empty`);

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    BACKEND_URL: z.url().optional(),
    FRONTEND_URL: z.url().optional(),
    ASSET_SIGNING_SECRET: required("ASSET_SIGNING_SECRET"),
    // Email is off until a sender domain is on Cloudflare DNS. Both are needed to send.
    EMAIL_FROM: z.email("EMAIL_FROM must be an email address").optional(),
    INSTITUTIONAL_EMAIL: z.email("INSTITUTIONAL_EMAIL must be an email address").optional(),
    SEED_PASSWORD: z.string().min(8).optional(),
    SUPPORTED_LOCALES: z.string().optional(),
    DEFAULT_LOCALE: z.string().optional(),
  })
  .refine((env) => env.NODE_ENV !== "production" || env.BACKEND_URL !== undefined, {
    path: ["BACKEND_URL"],
    error: "BACKEND_URL is required in production",
  });

export function parseEnv(raw: unknown) {
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid backend environment configuration:\n${z.prettifyError(parsed.error)}`);
  }
  return Object.freeze(parsed.data);
}

export const env = parseEnv(workerEnv);
