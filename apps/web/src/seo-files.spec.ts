import { describe, expect, it } from "vitest";

import { robotsTxt, sitemapResponse } from "./seo-files";

const origin = "https://gmcan.test";

describe("sitemapResponse", () => {
  it("lists static pages and published content in both languages", async () => {
    const entries = {
      news: [{ id: 4, updatedAt: "2026-03-01 10:00:00" }],
      members: [{ id: 9, updatedAt: "2026-01-01" }],
    };
    const response = await sitemapResponse(origin, async () => Response.json(entries));
    const xml = await response.text();

    expect(response.headers.get("Content-Type")).toContain("application/xml");
    expect(xml).toContain(`<loc>${origin}/home/about-us/about</loc>`);
    expect(xml).toContain(`<loc>${origin}/home/detail-news/4?lang=en</loc><lastmod>2026-03-01</lastmod>`);
    expect(xml).toContain(`hreflang="x-default" href="${origin}/home/detail-member/9"`);
    expect(xml).not.toContain("/dashboard");
  });

  it("fails visibly when the API cannot list the content", async () => {
    const response = await sitemapResponse(origin, async () => new Response("", { status: 500 }));
    expect(response.status).toBe(503);
  });
});

describe("robotsTxt", () => {
  it("keeps crawlers out of private pages and points them to the sitemap", async () => {
    const text = await robotsTxt(origin).text();
    expect(text).toContain("Disallow: /dashboard");
    expect(text).toContain(`Sitemap: ${origin}/sitemap.xml`);
  });
});
