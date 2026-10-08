#!/usr/bin/env bun
// Print the API's public routes as JSON from the Hono app that the Worker serves.
// scripts/ttfb.ts uses the output so the measurement list follows the code.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Set the state directory before importing the app because it reads configuration at load time.
// The route listing does not open the database.
const dir = mkdtempSync(join(tmpdir(), "gmcan-routes-"));
process.env.GMCAN_STATE_DIR = dir;
process.env.NODE_ENV = "test";
process.env.ASSET_SIGNING_SECRET = "routes";
await import("../apps/api/scripts/cloudflare-bun.js");
const { app } = await import("../apps/api/app.js");

// Exclude middleware layers. Hono records them as method ALL and repeats handlers behind them.
const routes = new Set(
  app.routes
    .filter((route) => route.method !== "ALL" && !route.path.startsWith("/admin"))
    .map((route) => `${route.method} ${route.path}`),
);
console.log(JSON.stringify([...routes]));
rmSync(dir, { recursive: true, force: true });
process.exit(0);
