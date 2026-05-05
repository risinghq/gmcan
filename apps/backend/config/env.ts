import { z } from "zod";

const NODE_ENV_VALUES = ["development", "test", "production"] as const;

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(NODE_ENV_VALUES).default("development"),
    BACKEND_URL: z.url().optional(),
    FRONTEND_URL: z.url().optional(),
    LIBSQL_URL: z.string().min(1).default("file:./data/gmcan.db"),
    LIBSQL_AUTH_TOKEN: z.string().min(1).optional(),
    ASSET_SIGNING_SECRET: z.string().min(1).default("dev-asset-secret"),
    RESEND_API_KEY: z.string().min(1).optional(),
    INSTITUTIONAL_EMAIL: z.email().optional(),
    ADMIN_LOCALES: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV === "production") {
      if (!value.RESEND_API_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["RESEND_API_KEY"],
          message: "RESEND_API_KEY is required in production",
        });
      }
      if (!value.INSTITUTIONAL_EMAIL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["INSTITUTIONAL_EMAIL"],
          message: "INSTITUTIONAL_EMAIL is required in production",
        });
      }
    }
  });

function parseAdminLocales(raw: string | undefined): Array<"es" | "en"> {
  const values = raw
    ?.split(",")
    .map((v) => v.trim())
    .filter((v): v is "es" | "en" => v === "es" || v === "en");
  if (!values || values.length === 0) return ["es", "en"];
  if (!values.includes("es") || !values.includes("en")) return ["es", "en"];
  return values;
}

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const formatted = z.prettifyError(parsed.error);
  throw new Error(`Invalid backend environment configuration:\n${formatted}`);
}

const FRONTEND_URLS: Record<(typeof NODE_ENV_VALUES)[number], string> = {
  production: "https://gmcan.unmsm.edu.pe",
  development: "http://localhost:4200",
  test: "http://localhost:4200",
};

const BACKEND_URLS: Record<(typeof NODE_ENV_VALUES)[number], string> = {
  production: "http://161.35.230.134:3000",
  development: "http://localhost:3000",
  test: "http://localhost:3000",
};

export const env = Object.freeze({
  ...parsed.data,
  FRONTEND_URL: parsed.data.FRONTEND_URL ?? FRONTEND_URLS[parsed.data.NODE_ENV],
  BACKEND_URL: (parsed.data.BACKEND_URL ?? BACKEND_URLS[parsed.data.NODE_ENV]).replace(/\/+$/, ""),
  ADMIN_LOCALES: parseAdminLocales(parsed.data.ADMIN_LOCALES),
});
