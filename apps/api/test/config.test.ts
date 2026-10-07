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

  test("a missing ASSET_SIGNING_SECRET is rejected and named", () => {
    expect(() => parseEnv({})).toThrow("ASSET_SIGNING_SECRET");
  });

  test("an empty ASSET_SIGNING_SECRET is rejected and named", () => {
    expect(() => parseEnv({ ASSET_SIGNING_SECRET: "" })).toThrow("ASSET_SIGNING_SECRET");
  });

  test.each(["EMAIL_FROM", "INSTITUTIONAL_EMAIL"])("%s must be an email address", (key) => {
    expect(() => parseEnv({ ...validEnv, [key]: "not-an-address" })).toThrow(key);
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
