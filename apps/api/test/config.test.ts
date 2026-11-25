import { describe, expect, test } from "bun:test";

import { getBackendUrl, resolveFrontendUrl, withRequestOrigin } from "../config.js";
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

  test("production requires the site URL", () => {
    expect(() => parseEnv({ ...validEnv, NODE_ENV: "production" })).toThrow("FRONTEND_URL");
    const site = { FRONTEND_URL: "https://site.example.test" };
    expect(parseEnv({ ...validEnv, NODE_ENV: "production", ...site })).toMatchObject(site);
  });
});

describe("public URLs", () => {
  test("the backend URL is the request's origin, and the local API outside a request", async () => {
    expect(await withRequestOrigin("http://localhost:4200/api/news", async () => getBackendUrl())).toBe(
      "http://localhost:4200",
    );
    expect(getBackendUrl()).toBe("http://localhost:3000");
  });

  test("the frontend URL is configurable and defaults to the local web app", () => {
    const configured = parseEnv({ ...validEnv, FRONTEND_URL: "https://web.example.test" });
    expect(resolveFrontendUrl(configured)).toBe("https://web.example.test");
    expect(resolveFrontendUrl(parseEnv(validEnv))).toBe("http://localhost:4200");
  });
});
