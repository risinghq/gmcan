import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { app } from "../app.js";

const SERVICES = join(import.meta.dir, "../../web/src/app/shared/services");

interface WebCall {
  file: string;
  method: string;
  path: string;
}

/** `GLOBAL.api` and `GLOBAL.admin` prefixes, plus any local helper such as `ref()` that wraps one. */
function urlBuilders(source: string): Map<string, string> {
  const builders = new Map([
    ["GLOBAL.api", "/api/"],
    ["GLOBAL.admin", "/admin/"],
  ]);
  const helper = /function (\w+)\(path: string\): string \{\s*return GLOBAL\.(api|admin)\(`([^`$]*)\$\{path\}`\);/g;
  for (const [, name, root, prefix] of source.matchAll(helper)) {
    builders.set(name, `/${root}/${prefix}`);
  }
  return builders;
}

/**
 * Each HTTP call a service makes, with template holes turned into a sample path segment, and how many times
 * the file builds a URL at all.
 */
function scan(file: string): { file: string; calls: WebCall[]; urls: number } {
  const source = readFileSync(join(SERVICES, file), "utf8");
  const builders = urlBuilders(source);
  const names = [...builders.keys()].map((name) => name.replace(".", "\\.")).join("|");
  const call = new RegExp(
    `\\.(get|post|put|patch|delete)\\s*(?:<[\\s\\S]*?>)?\\(\\s*(${names})\\(\\s*(["\`])([^"\`]*)\\3`,
    "g",
  );
  const calls = [...source.matchAll(call)].map(([, method, builder, , path]) => ({
    file,
    method: method.toUpperCase(),
    path: builders.get(builder) + path.replace(/\$\{[^}]*\}/g, "1"),
  }));

  // A helper is named once where it is defined and builds one URL in its body.
  const uses = source.match(new RegExp(`(?<![\\w.])(${names})\\(`, "g"))?.length ?? 0;
  return { file, calls, urls: uses - (builders.size - 2) * 2 };
}

function routePattern(path: string): RegExp {
  const source = path
    .split("/")
    .map((segment) => (segment.startsWith(":") ? "[^/]+" : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
    .join("/");
  return new RegExp(`^${source}/?$`);
}

const handlers = app.routes
  .filter((route) => route.method !== "ALL")
  .map((route) => ({ method: route.method, pattern: routePattern(route.path) }));

const scans = readdirSync(SERVICES)
  .filter((file) => file.endsWith(".service.ts"))
  .map(scan);
const calls = scans.flatMap((result) => result.calls);

describe("web endpoints", () => {
  test("the scan reads every URL a service builds as an HTTP call", () => {
    const built = scans.map(({ file, urls }) => ({ file, urls }));
    const read = scans.map((result) => ({ file: result.file, urls: result.calls.length }));
    expect(read).toEqual(built);
    expect(calls.length).toBeGreaterThan(50);
  });

  test("every call the web makes has an API route with that method", () => {
    const missing = calls.filter(
      (call) => !handlers.some((route) => route.method === call.method && route.pattern.test(call.path)),
    );
    expect(missing).toEqual([]);
  });
});
