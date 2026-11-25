import { describe, expect, it } from "vitest";

import { languageSwitchHref, resolveSiteLanguage } from "./site-language";

describe("resolveSiteLanguage", () => {
  it("prefers the URL, then the saved choice, then the browser, then Spanish", () => {
    const all = { cookie: "sid=1; lang=es", acceptLanguage: "es-PE,en;q=0.8" };
    expect(resolveSiteLanguage({ url: "/home?lang=en", ...all })).toBe("en");
    expect(resolveSiteLanguage({ url: "/home", ...all, cookie: "lang=en" })).toBe("en");
    expect(resolveSiteLanguage({ url: "/home", acceptLanguage: "en-US,es;q=0.5" })).toBe("en");
    expect(resolveSiteLanguage({ url: "/home" })).toBe("es");
  });
});

describe("languageSwitchHref", () => {
  it("names the language and keeps the rest of the address", () => {
    expect(languageSwitchHref("/home/news?page=2#top", "es")).toBe("/home/news?page=2&lang=es#top");
    expect(languageSwitchHref("/home?lang=es", "en")).toBe("/home?lang=en");
  });
});
