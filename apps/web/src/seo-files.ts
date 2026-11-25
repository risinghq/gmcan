import { SitemapSchema, type Sitemap } from "@gmcan/contracts/public";

import { LANGUAGE_PARAM } from "./app/shared/site-language";

const STATIC_PATHS = [
  "/home",
  "/home/publications",
  "/home/news",
  "/home/members",
  "/home/projects",
  "/home/about-us/about",
  "/home/about-us/lines-investigation",
  "/home/about-us/methods",
  "/home/about-us/facilities-resources",
  "/home/about-us/works",
  "/home/join-us",
];

const PRIVATE_PATHS = ["/dashboard", "/login", "/reset-password"];

export function robotsTxt(origin: string): Response {
  const body = [
    "User-agent: *",
    ...PRIVATE_PATHS.map((path) => `Disallow: ${path}`),
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function urlEntry(origin: string, path: string, updatedAt?: string): string {
  const es = `${origin}${path}`;
  const en = `${origin}${path}?${LANGUAGE_PARAM}=en`;
  const lastmod = updatedAt ? `<lastmod>${escapeXml(updatedAt.slice(0, 10))}</lastmod>` : "";
  const alternates = [
    `<xhtml:link rel="alternate" hreflang="es" href="${escapeXml(es)}"/>`,
    `<xhtml:link rel="alternate" hreflang="en" href="${escapeXml(en)}"/>`,
    `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(es)}"/>`,
  ].join("");
  return [es, en].map((loc) => `<url><loc>${escapeXml(loc)}</loc>${lastmod}${alternates}</url>`).join("\n");
}

/** Lists each public page in both languages, with the alternates crawlers use to pair them. */
export function sitemapXml(origin: string, entries: Sitemap): string {
  const urls = [
    ...STATIC_PATHS.map((path) => urlEntry(origin, path)),
    ...entries.news.map((item) => urlEntry(origin, `/home/detail-news/${item.id}`, item.updatedAt)),
    ...entries.members.map((item) => urlEntry(origin, `/home/detail-member/${item.id}`, item.updatedAt)),
  ];
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

export async function sitemapResponse(origin: string, loadEntries: () => Promise<Response>): Promise<Response> {
  const source = await loadEntries();
  if (!source.ok) return new Response("Sitemap unavailable", { status: 503 });
  const entries = SitemapSchema.parse(await source.json());
  return new Response(sitemapXml(origin, entries), {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
