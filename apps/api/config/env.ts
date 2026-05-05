import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  BACKEND_URL: z.url().optional(),
  FRONTEND_URL: z.url().optional(),
  LIBSQL_URL: z.string().min(1).default("file:./data/gmcan.db"),
  LIBSQL_AUTH_TOKEN: z.string().min(1).optional(),
  ASSET_SIGNING_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1).optional(),
  INSTITUTIONAL_EMAIL: z.email().optional(),
  ADMIN_LOCALES: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const formatted = z.prettifyError(parsed.error);
  throw new Error(`Invalid backend environment configuration:\n${formatted}`);
}

export const env = Object.freeze(parsed.data);
