import { z } from "zod";

const required = (what: string) => z.string(`${what} is required`).min(1, `${what} must not be empty`);

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    BACKEND_URL: z.url().optional(),
    FRONTEND_URL: z.url().optional(),
    LIBSQL_URL: z.string().min(1).default("file:./data/gmcan.db"),
    LIBSQL_AUTH_TOKEN: z.string().min(1).optional(),
    ASSET_SIGNING_SECRET: required("ASSET_SIGNING_SECRET"),
    RESEND_API_KEY: required("RESEND_API_KEY"),
    INSTITUTIONAL_EMAIL: z.email("INSTITUTIONAL_EMAIL must be an email address"),
    SEED_PASSWORD: z.string().min(8).optional(),
    SUPPORTED_LOCALES: z.string().optional(),
    DEFAULT_LOCALE: z.string().optional(),
  })
  .refine((env) => env.NODE_ENV !== "production" || env.BACKEND_URL !== undefined, {
    path: ["BACKEND_URL"],
    error: "BACKEND_URL is required in production",
  });

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const formatted = z.prettifyError(parsed.error);
  throw new Error(`Invalid backend environment configuration:\n${formatted}`);
}

export const env = Object.freeze(parsed.data);
