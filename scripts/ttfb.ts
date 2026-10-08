#!/usr/bin/env bun
/* oxlint-disable no-await-in-loop -- each sample redeploys once, then sends two ordered requests */
// Measures time to first byte on throwaway copies of the deployed Workers. See docs/performance.md for commands and flags.
import { cp, mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const PERF = join(ROOT, ".perf");
const ACCOUNT_HOST = "caefisica.workers.dev";
const SETTLE_MS = 3000;

type Worker = "api" | "web";

interface Route {
  name: string;
  worker: Worker;
  method: "GET" | "POST";
  path: string;
  body?: string;
  status: number;
  /** Keeps the URL identical so the web Worker answers from the data center's cache. */
  cached?: boolean;
}

const apiName = (arm: string) => `gmcan-api-perf-${arm}`;
const webName = (arm: string) => `gmcan-web-perf-${arm}`;
const originOf = (arm: string) => `https://${webName(arm)}.${ACCOUNT_HOST}`;
const armDir = (arm: string, worker: Worker) => join(PERF, "arm", arm, worker);
const codeDir = (code: string, worker: Worker) => join(PERF, "code", code, worker);

async function run(cmd: string[], cwd: string): Promise<string> {
  const proc = Bun.spawn(cmd, { cwd, stdout: "pipe", stderr: "pipe" });
  const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  if ((await proc.exited) !== 0) throw new Error(`${cmd.join(" ")} failed:\n${out}\n${err}`);
  return out;
}

const wrangler = (args: string[], cwd: string) => run(["bunx", "wrangler", ...args], cwd);

async function readConfig(app: Worker) {
  const path = join(ROOT, "apps", app, "wrangler.jsonc");
  return Bun.JSONC.parse(await Bun.file(path).text()) as Record<string, unknown>;
}

/** Bundle both Workers once so every cold sample redeploys identical bytes. */
async function stage(code: string) {
  await rm(join(PERF, "code", code), { recursive: true, force: true });
  await mkdir(codeDir(code, "api"), { recursive: true });
  await mkdir(codeDir(code, "web"), { recursive: true });
  await wrangler(["deploy", "--dry-run", "--outdir", codeDir(code, "api")], join(ROOT, "apps/api"));
  await run(["bun", "run", "build"], join(ROOT, "apps/web"));
  await wrangler(["deploy", "--dry-run", "--outdir", codeDir(code, "web")], join(ROOT, "apps/web"));
  await cp(join(ROOT, "apps/web/dist/tesisFront/browser"), join(codeDir(code, "web"), "browser"), { recursive: true });
}

async function writeArmConfigs(arm: string, code: string) {
  const api = await readConfig("api");
  const apiConfig = {
    ...api,
    name: apiName(arm),
    main: join(codeDir(code, "api"), "worker.js"),
    triggers: { crons: [] },
    vars: { ...(api.vars as object), BACKEND_URL: originOf(arm), FRONTEND_URL: originOf(arm) },
  };
  const web = await readConfig("web");
  const webConfig = {
    ...web,
    name: webName(arm),
    main: join(codeDir(code, "web"), "server.js"),
    assets: { binding: "ASSETS", directory: join(codeDir(code, "web"), "browser") },
    alias: undefined,
    services: [{ binding: "API", service: apiName(arm) }],
  };
  await mkdir(armDir(arm, "api"), { recursive: true });
  await mkdir(armDir(arm, "web"), { recursive: true });
  await Bun.write(join(armDir(arm, "api"), "wrangler.jsonc"), JSON.stringify(apiConfig, null, 2));
  await Bun.write(join(armDir(arm, "web"), "wrangler.jsonc"), JSON.stringify(webConfig, null, 2));
  await Bun.write(join(PERF, "arm", arm, "code"), code);
}

async function deploy(arm: string, worker: Worker, nonce: string, secretsFile?: string) {
  const args = ["deploy", "-c", "wrangler.jsonc", "--no-bundle", "--var", `NONCE:${nonce}`];
  if (secretsFile) args.push("--secrets-file", secretsFile);
  for (let attempt = 1; ; attempt++) {
    try {
      return void (await wrangler(args, armDir(arm, worker)));
    } catch (error) {
      if (attempt === 3) throw error;
      await Bun.sleep(5000);
    }
  }
}

async function up(arm: string, code: string) {
  await writeArmConfigs(arm, code);
  const secrets = join(PERF, "arm", arm, "secrets.env");
  await Bun.write(secrets, `ASSET_SIGNING_SECRET=${crypto.randomUUID()}${crypto.randomUUID()}\n`);
  await deploy(arm, "api", "up", secrets);
  await rm(secrets);
  await deploy(arm, "web", "up");
}

/** Return whether the Worker is gone. Treat a failed delete as present unless Cloudflare reports it missing. */
async function remove(name: string, cwd: string): Promise<boolean> {
  try {
    await wrangler(["delete", "--name", name, "--force"], cwd);
    return true;
  } catch (error) {
    console.error(String(error));
    return wrangler(["deployments", "list", "--name", name], cwd).then(
      () => false,
      (lookup) => /does not exist|10007/i.test(String(lookup)),
    );
  }
}

/** Delete the web copy before the API copy because the web copy holds the service binding. */
async function down(arm: string) {
  const gone = [await remove(webName(arm), join(ROOT, "apps/web")), await remove(apiName(arm), join(ROOT, "apps/api"))];
  const left = [webName(arm), apiName(arm)].filter((_, index) => !gone[index]);
  if (left.length === 0) return;
  console.error(`Not deleted, delete these Workers by hand: ${left.join(", ")}`);
  process.exitCode = 1;
}

/** Stop before sampling if the API copy holds a mail key. */
async function assertNoMailKey(arm: string) {
  const secrets = await wrangler(["secret", "list", "--name", apiName(arm)], armDir(arm, "api"));
  if (secrets.includes("RESEND_API_KEY"))
    throw new Error(`${apiName(arm)} holds RESEND_API_KEY; delete it or use another arm`);
}

/** Return the time from the end of the TLS handshake to the first response byte. */
async function sample(origin: string, route: Route): Promise<{ ms: number; status: number; cache: string }> {
  const url = new URL(route.path, origin);
  if (route.worker === "api" && route.method === "GET") url.searchParams.set("cb", crypto.randomUUID());
  const args = ["curl", "-s", "-o", "/dev/null", "-D", "-", "--max-time", "30", "-H", "Accept-Language: es"];
  if (route.method === "POST") args.push("-X", "POST", "-H", "Content-Type: application/json", "-d", route.body ?? "");
  args.push("-w", "\n%{time_appconnect} %{time_starttransfer} %{http_code}", url.toString());
  const proc = Bun.spawn(args, { stdout: "pipe" });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  const [connected, first, status] = out.trim().split("\n").at(-1)!.split(" ").map(Number);
  const cache = /^x-cache: (\w+)/im.exec(out)?.[1] ?? "";
  return { ms: Math.round((first! - connected!) * 1000), status: status!, cache };
}

async function getJson(origin: string, path: string): Promise<any> {
  return (await fetch(new URL(path, origin))).json();
}

/** Use a token that no member holds so token routes perform no write. */
const UNKNOWN_TOKEN = "0".repeat(64);

/**
 * Every public POST route needs an entry or the run stops. The copy has no mail key
 * or institutional address, so mail routes answer 503 at configuration. Token routes
 * look up UNKNOWN_TOKEN and answer 400 without a write.
 */
const POST_FIXTURES: Record<string, { label: string; body: object; status: number }> = {
  "/api/email/contact": {
    label: "mail not configured",
    body: { name: "Nobody", reason: "Measuring", email: "nobody@example.invalid", phone: "0" },
    status: 503,
  },
  "/api/email/password-reset/request": {
    label: "mail not configured",
    body: { email: "nobody@example.invalid" },
    status: 503,
  },
  "/api/email/password-reset/verify": { label: "unknown token", body: { token: UNKNOWN_TOKEN }, status: 400 },
  "/api/email/password-reset/confirm": {
    label: "unknown token",
    body: { token: UNKNOWN_TOKEN, newPassword: "unused-password" },
    status: 400,
  },
};

/** Query strings required for public GET routes to answer 200. */
const GET_QUERIES: Record<string, string> = { "/api/search": "?q=nano" };

const GROUP_ID = "1";

/** Return the first row's id for a listing route. */
async function firstId(origin: string, resource: string): Promise<string> {
  const body = await getJson(origin, `/api/${resource}${resource === "news" ? "?pageSize=1" : ""}`);
  return String((Array.isArray(body) ? body : body.items)[0].id);
}

/** List the API's public routes and assign each one a request. */
async function publicApiRoutes(origin: string): Promise<Route[]> {
  const listed: string[] = JSON.parse(await run(["bun", join(ROOT, "scripts/public-routes.ts")], ROOT));
  const publications = await getJson(origin, "/api/publications");
  const assetId = String(publications[0].asset.inline).split("/").at(-1)!;
  const routes: Route[] = [];
  for (const entry of listed) {
    const [method, template] = entry.split(" ") as [string, string];
    const resource = template.split("/")[2]!;
    let path = template;
    for (const [param, name] of template.matchAll(/:(\w+)/g).map((match) => [match[0], match[1]!] as const)) {
      if (name === "assetId") path = path.replace(param, assetId);
      else if (resource === "group") path = path.replace(param, GROUP_ID);
      else if (name === "id") path = path.replace(param, await firstId(origin, resource));
      else throw new Error(`No example value for ${param} in ${entry}; add one to publicApiRoutes`);
    }
    const label = template.replace(/:\w+/g, ":id");
    if (method === "GET") {
      routes.push({ name: label, worker: "api", method, path: path + (GET_QUERIES[template] ?? ""), status: 200 });
    } else if (method === "POST") {
      const fixture = POST_FIXTURES[template];
      if (!fixture) throw new Error(`No request for ${entry}; add one to POST_FIXTURES`);
      routes.push({
        name: `POST ${label} (${fixture.label})`,
        worker: "api",
        method,
        path,
        body: JSON.stringify(fixture.body),
        status: fixture.status,
      });
    } else {
      throw new Error(`No way to measure ${entry}; teach publicApiRoutes the method`);
    }
  }
  return routes;
}

async function discoverRoutes(origin: string): Promise<Route[]> {
  return [
    { name: "web /config.json", worker: "web", method: "GET", path: "/config.json", status: 200 },
    { name: "web /home (page shell)", worker: "web", method: "GET", path: "/home", status: 200 },
    {
      name: "web /api/lookup (data center cache)",
      worker: "web",
      method: "GET",
      path: "/api/lookup",
      status: 200,
      cached: true,
    },
    ...(await publicApiRoutes(origin)),
    {
      name: "POST /admin/auth/login (unknown email)",
      worker: "api",
      method: "POST",
      path: "/admin/auth/login",
      body: JSON.stringify({ email: "nobody@example.invalid", password: "x" }),
      status: 401,
    },
    {
      name: "GET /admin/dashboard/summary (no session)",
      worker: "api",
      method: "GET",
      path: "/admin/dashboard/summary",
      status: 401,
    },
  ];
}

function flag(args: string[], name: string, fallback: string): string {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1]! : fallback;
}

/**
 * Redeploys the route's Worker before each sample to create a new isolate. The
 * first request is cold and the second is warm. Arms alternate request order,
 * and routes rotate by sample, so network and data-center drift reaches each
 * arm and route.
 */
async function measure(arms: string[], args: string[]) {
  const samples = Number(flag(args, "samples", "30"));
  const names = flag(args, "routes", "").split(",").filter(Boolean);
  const [part, parts] = flag(args, "part", "1/1").split("/").map(Number) as [number, number];
  const out = flag(args, "out", join(PERF, `${arms.join("-")}.jsonl`));
  const codes = await Promise.all(arms.map((arm) => Bun.file(join(PERF, "arm", arm, "code")).text()));
  const everything = await discoverRoutes(originOf(arms[0]!));
  const routes = everything
    .filter((route) => names.length === 0 || names.includes(route.name))
    .filter((_, index) => index % parts === part - 1);
  if (routes.some((route) => route.path.startsWith("/api/email/"))) {
    for (const arm of arms) await assertNoMailKey(arm);
  }
  for (const route of routes.filter((candidate) => candidate.cached)) {
    for (const arm of arms) await sample(originOf(arm), route);
  }
  const file = Bun.file(out);
  let log = (await file.exists()) ? await file.text() : "";
  const done = new Set(
    log
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const row = JSON.parse(line);
        return `${row.route}|${row.i}`;
      }),
  );

  for (let i = 0; i < samples; i++) {
    for (let r = 0; r < routes.length; r++) {
      const route = routes[(r + i) % routes.length]!;
      if (done.has(`${route.name}|${i}`)) continue;
      await Promise.all(arms.map((arm) => deploy(arm, route.worker, `${i}-${r}-${Date.now()}`)));
      await Bun.sleep(SETTLE_MS);
      const order = arms.map((_, index) => index);
      if (i % 2 === 1) order.reverse();
      const cold = new Map<number, Awaited<ReturnType<typeof sample>>>();
      for (const index of order) cold.set(index, await sample(originOf(arms[index]!), route));
      for (const index of order) {
        const warm = await sample(originOf(arms[index]!), route);
        const first = cold.get(index)!;
        const row = {
          code: codes[index],
          arm: arms[index],
          route: route.name,
          i,
          cold: first.ms,
          warm: warm.ms,
          status: [first.status, warm.status],
          cache: [first.cache, warm.cache],
          expected: route.status,
        };
        log += `${JSON.stringify(row)}\n`;
      }
      await Bun.write(out, log);
      console.log(`sample ${i + 1}/${samples} ${route.name}`);
    }
  }
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return NaN;
  const at = (sorted.length - 1) * p;
  const lo = Math.floor(at);
  const hi = Math.ceil(at);
  return Math.round(sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (at - lo));
}

const sortNumbers = (values: number[]) => values.toSorted((a, b) => a - b);

function spread(rows: { i: number; ms: number }[]): number {
  const medians = [0, 1, 2].map((offset) =>
    percentile(sortNumbers(rows.filter((row) => row.i % 3 === offset).map((row) => row.ms)), 0.5),
  );
  return Math.max(...medians) - Math.min(...medians);
}

async function report(files: string[]) {
  const rows = (await Promise.all(files.map((file) => Bun.file(file).text())))
    .flatMap((text) => text.split("\n").filter(Boolean))
    .map((line) => JSON.parse(line));
  const bad = rows.filter((row) => row.status.some((status: number) => status !== row.expected));
  const good = rows.filter((row) => !bad.includes(row));
  const codes = [...new Set(rows.map((row) => row.code))];
  const names = [...new Set(rows.map((row) => row.route))];
  console.log(`${good.length} samples kept, ${bad.length} dropped for an unexpected status\n`);
  console.log("| route | code | n | cold p50 | cold p95 | cold spread | warm p50 | warm p95 | warm spread |");
  console.log("| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const name of names) {
    for (const code of codes) {
      const mine = good.filter((row) => row.route === name && row.code === code);
      if (mine.length === 0) {
        // A route that never answered as expected gets a row saying so, not silence.
        const failed = bad.filter((row) => row.route === name && row.code === code);
        if (failed.length === 0) continue;
        const answered = [...new Set(failed.flatMap((row) => row.status))].join(", ");
        console.log(`| ${name} | ${code} | 0 | failed: ${answered} | - | - | failed: ${answered} | - | - |`);
        continue;
      }
      const cold = mine.map((row) => ({ i: row.i, ms: row.cold }));
      const warm = mine.map((row) => ({ i: row.i, ms: row.warm }));
      const c = sortNumbers(cold.map((row) => row.ms));
      const w = sortNumbers(warm.map((row) => row.ms));
      console.log(
        `| ${name} | ${code} | ${mine.length} | ${percentile(c, 0.5)} | ${percentile(c, 0.95)} | ${spread(cold)} | ${percentile(w, 0.5)} | ${percentile(w, 0.95)} | ${spread(warm)} |`,
      );
    }
  }
  if (bad.length === 0) return;
  console.log(
    "\nDropped samples: the route did not answer with its expected status, so its times are not in the table.\n",
  );
  console.log("| route | expected | answered | n | cold p50 | warm p50 |");
  console.log("| --- | ---: | --- | ---: | ---: | ---: |");
  for (const name of new Set(bad.map((row) => row.route))) {
    const mine = bad.filter((row) => row.route === name);
    const answered = [...new Set(mine.flatMap((row) => row.status))].join(", ");
    const cold = sortNumbers(mine.map((row) => row.cold));
    const warm = sortNumbers(mine.map((row) => row.warm));
    console.log(
      `| ${name} | ${mine[0].expected} | ${answered} | ${mine.length} | ${percentile(cold, 0.5)} | ${percentile(warm, 0.5)} |`,
    );
  }
}

const [command, target = "", ...rest] = Bun.argv.slice(2);
if (command === "stage") await stage(target);
else if (command === "up") await up(target, rest[0] ?? "");
else if (command === "down") await down(target);
else if (command === "run") await measure(target.split(","), rest);
else if (command === "report") await report([target, ...rest]);
else {
  console.error("usage: bun scripts/ttfb.ts stage|up|run|report|down ...");
  process.exit(2);
}
