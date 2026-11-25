import type { Languages } from "@app/shared/models/languages";

const PUBLIC_ORIGINS = ["home", "news", "members", "projects", "publications", "search", "about"] as const;

export type PublicOrigin = (typeof PUBLIC_ORIGINS)[number];

type Language = (typeof Languages)[number];

const ROUTES: Record<PublicOrigin, string> = {
  home: "/",
  news: "/news",
  members: "/members",
  projects: "/projects",
  publications: "/publications",
  search: "/",
  about: "/about-us/about",
};

const LABELS: Record<PublicOrigin, (language: Language) => string> = {
  home: (l) => l.home,
  news: (l) => l.news,
  members: (l) => l.members,
  projects: (l) => l.projects,
  publications: (l) => l.publications,
  search: (l) => l.results,
  about: (l) => l.who,
};

export function parsePublicOrigin(from: string | null | undefined): PublicOrigin {
  return (PUBLIC_ORIGINS as readonly string[]).includes(from ?? "") ? (from as PublicOrigin) : "home";
}

export function originRoute(origin: PublicOrigin): string {
  return ROUTES[origin];
}

export function originLabel(origin: PublicOrigin, language: Language): string {
  return LABELS[origin](language);
}
