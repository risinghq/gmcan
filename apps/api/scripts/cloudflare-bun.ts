// Preload for Bun processes that import the Worker code (tests, seeding): resolves
// "cloudflare:workers" to wrangler's local D1 and R2 emulation. State lives in
// GMCAN_STATE_DIR, or in .wrangler/state when unset.
import { join } from "node:path";

import { plugin } from "bun";
import { getPlatformProxy } from "wrangler";

const OVERRIDABLE = [
  "NODE_ENV",
  "BACKEND_URL",
  "FRONTEND_URL",
  "ASSET_SIGNING_SECRET",
  "EMAIL_FROM",
  "INSTITUTIONAL_EMAIL",
  "SEED_PASSWORD",
  "SUPPORTED_LOCALES",
  "DEFAULT_LOCALE",
] as const;

const proxy = await getPlatformProxy({
  configPath: new URL("../wrangler.jsonc", import.meta.url).pathname,
  persist: { path: join(process.env.GMCAN_STATE_DIR ?? new URL("../.wrangler/state", import.meta.url).pathname, "v3") },
});

const env: Record<string, unknown> = { ...proxy.env };
for (const key of OVERRIDABLE) {
  const value = process.env[key];
  if (value !== undefined) env[key] = value;
}

plugin({
  name: "cloudflare-workers",
  setup(build) {
    build.module("cloudflare:workers", () => ({ exports: { env }, loader: "object" }));
  },
});

process.on("exit", () => void proxy.dispose());
