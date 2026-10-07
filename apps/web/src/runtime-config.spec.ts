import { beforeEach, describe, expect, it } from "vitest";

import { environment } from "./environments/environment";
import { applyRuntimeConfig, currentRuntimeConfig } from "./runtime-config";

describe("runtime config", () => {
  beforeEach(() => {
    environment.apiUrl = "";
    environment.appUrl = "";
  });

  it("overrides the build's URLs with the given ones", () => {
    applyRuntimeConfig({ apiUrl: "https://app.example.test", appUrl: "https://app.example.test" });
    expect(currentRuntimeConfig()).toEqual({ apiUrl: "https://app.example.test", appUrl: "https://app.example.test" });
  });

  it("fails naming apiUrl when it is empty", () => {
    expect(() => applyRuntimeConfig({ apiUrl: "", appUrl: "https://app.example.test" })).toThrow(/apiUrl/);
  });

  it("fails naming appUrl when it is missing", () => {
    expect(() => applyRuntimeConfig({ apiUrl: "https://app.example.test" })).toThrow(/appUrl/);
  });
});
