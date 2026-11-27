#!/usr/bin/env bun
// Fetches every public page from a deployed site and fails unless each renders on the server with one h1.
// See docs/deploy.md.
const origin = process.argv[2]?.replace(/\/$/, "");
if (!origin) {
  console.error("usage: bun scripts/smoke.ts <origin>");
  process.exit(2);
}

const STATIC_PAGES = [
  "/",
  "/publications",
  "/projects",
  "/news",
  "/members",
  "/join-us",
  "/about-us/about",
  "/about-us/lines-investigation",
  "/about-us/methods",
  "/about-us/facilities-resources",
  "/about-us/works",
];

async function detailPage(list: string, page: string): Promise<string[]> {
  const response = await fetch(`${origin}${list}`);
  if (!response.ok) throw new Error(`${list} answered ${response.status}`);

  const body = (await response.json()) as { id: number }[] | { items: { id: number }[] };
  const [first] = Array.isArray(body) ? body : body.items;
  return first ? [`${page}/${first.id}`] : [];
}

async function pages(): Promise<string[]> {
  const details = await Promise.all([
    detailPage("/api/news?pageSize=1", "/detail-news"),
    detailPage("/api/members?pageSize=1", "/detail-member"),
  ]);
  return [...STATIC_PAGES, ...details.flat()];
}

async function problem(path: string): Promise<string | undefined> {
  const response = await fetch(`${origin}${path}`);
  if (response.status !== 200) return `${path}: status ${response.status}`;

  const headings = (await response.text()).match(/<h1[\s>]/g)?.length ?? 0;
  if (headings !== 1) return `${path}: ${headings} h1 elements`;
}

async function missingPageProblem(): Promise<string | undefined> {
  const response = await fetch(`${origin}/no-such-page`);
  if (response.status !== 404) return `/no-such-page: status ${response.status}, expected 404`;
}

const paths = await pages();
const problems = (await Promise.all([...paths.map(problem), missingPageProblem()])).filter(Boolean);

for (const line of problems) console.error(line);
console.log(`${paths.length + 1 - problems.length}/${paths.length + 1} pages passed`);
process.exit(problems.length ? 1 : 0);
