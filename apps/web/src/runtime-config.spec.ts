import { beforeEach, describe, expect, it } from "vitest";

import { environment } from "./environments/environment";
import { applyRuntimeConfig, applyServerEnv, currentRuntimeConfig } from "./runtime-config";

const production = {
  API_URL: "https://api.example.test",
  APP_URL: "https://app.example.test",
  NG_ALLOWED_HOSTS: "app",
};

describe("runtime config", () => {
  beforeEach(() => {
    environment.production = false;
    environment.apiUrl = "";
    environment.appUrl = "";
  });

  it("overrides the build's URLs with the given ones", () => {
    applyRuntimeConfig({ apiUrl: "https://api.example.test", appUrl: "https://app.example.test" });
    expect(currentRuntimeConfig()).toEqual({ apiUrl: "https://api.example.test", appUrl: "https://app.example.test" });
  });

  it("fails at startup naming API_URL when it is empty", () => {
    expect(() => applyRuntimeConfig({ apiUrl: "", appUrl: "https://app.example.test" })).toThrow(/API_URL/);
  });

  it("fails at startup naming APP_URL when it is missing", () => {
    expect(() => applyRuntimeConfig({ apiUrl: "https://api.example.test" })).toThrow(/APP_URL/);
  });

  it("accepts a complete production environment", () => {
    environment.production = true;
    applyServerEnv(production);
    expect(currentRuntimeConfig().apiUrl).toBe("https://api.example.test");
  });

  it("requires NG_ALLOWED_HOSTS in production", () => {
    environment.production = true;
    const { NG_ALLOWED_HOSTS: _omitted, ...env } = production;
    expect(() => applyServerEnv(env)).toThrow(/NG_ALLOWED_HOSTS/);
  });
});
