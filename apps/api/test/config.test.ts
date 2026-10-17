import { describe, expect, test } from "bun:test";

import { resolveBackendUrl, resolveFrontendUrl } from "../config.js";
import { parseEnv } from "../config/env.js";

const validEnv = { ASSET_SIGNING_SECRET: "secret" };

describe("environment", () => {
  test("a minimal environment is valid and email stays off", () => {
    const env = parseEnv(validEnv);
    expect(env.NODE_ENV).toBe("development");
    expect(env.EMAIL_FROM).toBeUndefined();
    expect(env.INSTITUTIONAL_EMAIL).toBeUndefined();
  });

  test.each([
    ["a missing ASSET_SIGNING_SECRET", {}, "ASSET_SIGNING_SECRET"],
    ["an empty ASSET_SIGNING_SECRET", { ASSET_SIGNING_SECRET: "" }, "ASSET_SIGNING_SECRET"],
    ["an empty RESEND_API_KEY", { ...validEnv, RESEND_API_KEY: "" }, "RESEND_API_KEY"],
    ["an EMAIL_FROM that is not an address", { ...validEnv, EMAIL_FROM: "not-an-address" }, "EMAIL_FROM"],
    [
      "an INSTITUTIONAL_EMAIL that is not an address",
      { ...validEnv, INSTITUTIONAL_EMAIL: "not-an-address" },
      "INSTITUTIONAL_EMAIL",
    ],
  ])("%s is rejected and named", (_case, raw, key) => {
    expect(() => parseEnv(raw)).toThrow(key);
  });

  test("production requires BACKEND_URL", () => {
    expect(() => parseEnv({ ...validEnv, NODE_ENV: "production" })).toThrow("BACKEND_URL");
    expect(parseEnv({ ...validEnv, NODE_ENV: "production", BACKEND_URL: "https://api.example.test" }).BACKEND_URL).toBe(
      "https://api.example.test",
    );
  });
});

describe("public URLs", () => {
  test("the backend URL drops trailing slashes", () => {
    const env = parseEnv({ ...validEnv, NODE_ENV: "production", BACKEND_URL: "https://api.example.test/" });
    expect(resolveBackendUrl(env)).toBe("https://api.example.test");
  });

  test("the frontend URL is configurable and defaults per environment", () => {
    const production = parseEnv({ ...validEnv, NODE_ENV: "production", BACKEND_URL: "https://api.example.test" });
    expect(resolveFrontendUrl(production)).toBe("https://gmcan.unmsm.edu.pe");
    const configured = parseEnv({ ...validEnv, FRONTEND_URL: "https://web.example.test" });
    expect(resolveFrontendUrl(configured)).toBe("https://web.example.test");
    expect(resolveFrontendUrl(parseEnv(validEnv))).toBe("http://localhost:4200");
  });
});
