import { describe, expect, it } from "vitest";

import { movedLocation } from "./moved-url";

function moved(path: string): string | undefined {
  return movedLocation(new URL(path, "https://site.test"));
}

describe("movedLocation", () => {
  it("leaves current URLs alone", () => {
    for (const path of ["/", "/news?page=2", "/en", "/en/", "/en/detail-news/4", "/dashboard", "/homepage"]) {
      expect(moved(path)).toBeUndefined();
    }
  });

  it("moves public pages out of /home in either language", () => {
    expect(moved("/home")).toBe("/");
    expect(moved("/home/detail-news/4?from=news")).toBe("/detail-news/4?from=news");
    expect(moved("/en/home")).toBe("/en/");
    expect(moved("/en/home/about-us/works")).toBe("/en/about-us/works");
  });

  it("turns ?lang= links into the language's path", () => {
    expect(moved("/home/news?lang=en&page=2")).toBe("/en/news?page=2");
    expect(moved("/en/news?lang=es")).toBe("/news");
    expect(moved("/news?lang=es")).toBe("/news");
  });

  it("sends English URLs of Spanish-only pages to the Spanish build", () => {
    expect(moved("/en/dashboard/news")).toBe("/dashboard/news");
    expect(moved("/login?lang=en")).toBe("/login");
  });
});
