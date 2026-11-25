import { describe, expect, it } from "vitest";

import { englishAppPath, languagePath, localeLanguage } from "./site-language";

describe("localeLanguage", () => {
  it("reads the language from the build's locale", () => {
    expect(localeLanguage("en-US")).toBe("en");
    expect(localeLanguage("es-PE")).toBe("es");
  });
});

describe("languagePath", () => {
  it("keeps Spanish paths and moves English under /en", () => {
    expect(languagePath("/news?page=2#top", "es")).toBe("/news?page=2#top");
    expect(languagePath("/news?page=2#top", "en")).toBe("/en/news?page=2#top");
    expect(languagePath("/", "en")).toBe("/en/");
  });

  it("round-trips with englishAppPath", () => {
    for (const path of ["/", "/news"]) {
      expect(englishAppPath(languagePath(path, "en"))).toBe(path);
      expect(englishAppPath(languagePath(path, "es"))).toBeUndefined();
    }
    expect(englishAppPath("/english")).toBeUndefined();
  });
});
