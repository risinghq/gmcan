import { Languages } from "@app/shared/models/languages";
import { describe, expect, it } from "vitest";

import { originLabel, originRoute, parsePublicOrigin } from "./public-origin";

const [spanish, english] = Languages;

describe("public origin", () => {
  it("falls back to home for a missing or unknown origin", () => {
    expect(parsePublicOrigin(null)).toBe("home");
    expect(parsePublicOrigin(undefined)).toBe("home");
    expect(parsePublicOrigin("dashboard")).toBe("home");
  });

  it("links back to the page the visitor came from", () => {
    expect(originRoute(parsePublicOrigin("news"))).toBe("/news");
    expect(originRoute(parsePublicOrigin("about"))).toBe("/about-us/about");
  });

  it("labels the origin in the visitor's language", () => {
    expect(originLabel("news", spanish)).toBe("Noticias");
    expect(originLabel("news", english)).toBe("News");
    expect(originLabel("about", english)).toBe("What is GMCAN?");
  });
});
