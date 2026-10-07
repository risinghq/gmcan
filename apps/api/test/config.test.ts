import { describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const apiDir = join(import.meta.dir, "..");
const bun = process.execPath;

const validEnv: Record<string, string> = {
  ASSET_SIGNING_SECRET: "secret",
  RESEND_API_KEY: "re_key",
  INSTITUTIONAL_EMAIL: "group@example.test",
};

function run(args: string[], env: Record<string, string>) {
  const proc = Bun.spawnSync({
    cmd: [bun, ...args],
    cwd: apiDir,
    env: { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "", ...env },
  });
  return { exitCode: proc.exitCode, stdout: proc.stdout.toString().trim(), stderr: proc.stderr.toString().trim() };
}

function loadConfig(env: Record<string, string>, envFile?: string) {
  const args = envFile ? [`--env-file=${envFile}`] : [];
  return run([...args, "test/fixtures/load-config.ts"], env);
}

describe("environment", () => {
  test(".env.example is a working template", () => {
    const res = loadConfig({}, "../../.env.example");
    expect(res.stderr).toBe("");
    expect(res.exitCode).toBe(0);
  });

  test(".env.example lists only keys the code reads", async () => {
    const template = await Bun.file(join(apiDir, "../../.env.example")).text();
    const keys = [...template.matchAll(/^#?\s*([A-Z][A-Z0-9_]+)=/gm)].map((m) => m[1]);
    const source = await Promise.all(["config/env.ts", "config.ts"].map((f) => Bun.file(join(apiDir, f)).text()));
    for (const key of keys) expect(source.join("\n")).toContain(key);
  });

  for (const key of ["RESEND_API_KEY", "INSTITUTIONAL_EMAIL"]) {
    test(`a missing ${key} stops startup and names it`, () => {
      const { [key]: _omitted, ...env } = validEnv;
      const res = loadConfig(env);
      expect(res.exitCode).not.toBe(0);
      expect(res.stderr).toContain(key);
    });

    test(`an empty ${key} stops startup and names it`, () => {
      const res = loadConfig({ ...validEnv, [key]: "" });
      expect(res.exitCode).not.toBe(0);
      expect(res.stderr).toContain(key);
    });
  }

  test("production requires BACKEND_URL", () => {
    const res = loadConfig({ ...validEnv, NODE_ENV: "production" });
    expect(res.exitCode).not.toBe(0);
    expect(res.stderr).toContain("BACKEND_URL");
  });

  test("production uses the configured BACKEND_URL", () => {
    const res = loadConfig({ ...validEnv, NODE_ENV: "production", BACKEND_URL: "https://api.example.test/" });
    expect(res.exitCode).toBe(0);
    expect(JSON.parse(res.stdout).backend).toBe("https://api.example.test");
  });
});

function newDatabase() {
  return `file:${join(mkdtempSync(join(tmpdir(), "gmcan-seed-")), "seed.db")}`;
}

function seed(libsqlUrl: string, env: Record<string, string>, candidates: string[]) {
  const res = run(["test/fixtures/seed-members.ts", ...candidates], { ...validEnv, LIBSQL_URL: libsqlUrl, ...env });
  expect(res.exitCode).toBe(0);
  return {
    accepted: JSON.parse(res.stdout.split("\n").at(-1)!) as string[],
    generated: res.stdout.match(/generated password: (\S+)/)?.[1],
  };
}

describe("seeded member password", () => {
  test("is read from SEED_PASSWORD", () => {
    const res = seed(newDatabase(), { SEED_PASSWORD: "from-the-environment" }, ["from-the-environment", "password123"]);
    expect(res.accepted).toEqual(["from-the-environment"]);
    expect(res.generated).toBeUndefined();
  }, 30_000);

  test("is generated and printed when SEED_PASSWORD is unset", () => {
    const url = newDatabase();
    const first = seed(url, {}, ["password123"]);
    expect(first.accepted).toEqual([]);
    expect(first.generated).toBeDefined();

    const second = seed(url, {}, ["password123", first.generated!]);
    expect(second.accepted).toEqual([first.generated!]);
    expect(second.generated).toBeUndefined();

    expect(seed(newDatabase(), {}, []).generated).not.toBe(first.generated);
  }, 60_000);
});
