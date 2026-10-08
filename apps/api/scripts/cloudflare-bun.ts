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

// Bun cannot receive an R2 stream from the platform proxy. Reading `body` throws a DataCloneError.
// The emulated bucket therefore rebuilds each object's body from its bytes. The deployed Worker streams from R2.
const bucket = env.STORAGE as R2Bucket;
env.STORAGE = new Proxy(bucket, {
  get(target, property) {
    if (property !== "get") {
      const value = Reflect.get(target, property) as unknown;
      return typeof value === "function" ? value.bind(target) : value;
    }
    return async (...args: Parameters<R2Bucket["get"]>) => {
      const object = await target.get(...args);
      if (!object || !("arrayBuffer" in object)) return object;
      const bytes = await object.arrayBuffer();
      return Object.create(object, {
        body: { value: new Blob([bytes]).stream() },
        arrayBuffer: { value: async () => bytes },
      });
    };
  },
});

plugin({
  name: "cloudflare-workers",
  setup(build) {
    build.module("cloudflare:workers", () => ({ exports: { env }, loader: "object" }));
  },
});

process.on("exit", () => void proxy.dispose());
