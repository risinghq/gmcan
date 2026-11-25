import type { ActivatedRoute } from "@angular/router";

const PUBLIC_ORIGINS = ["home", "news", "members", "projects", "publications", "search", "about"] as const;

export type PublicOrigin = (typeof PUBLIC_ORIGINS)[number];

export type PublicOriginInfo = {
  route: string;
  label: string;
};

export function parsePublicOrigin(route: ActivatedRoute): PublicOrigin {
  const from = route.snapshot.queryParamMap.get("from");
  if (from && (PUBLIC_ORIGINS as readonly string[]).includes(from)) {
    return from as PublicOrigin;
  }
  return "home";
}

export function getPublicOriginInfo(origin: PublicOrigin): PublicOriginInfo {
  const labels = {
    home: "Inicio",
    news: "Noticias",
    members: "Miembros",
    projects: "Proyectos",
    publications: "Publicaciones",
    search: "Resultados de Búsqueda",
    about: "¿Quiénes Somos?",
  };

  const routes: Record<PublicOrigin, string> = {
    home: "/",
    news: "/news",
    members: "/members",
    projects: "/projects",
    publications: "/publications",
    search: "/",
    about: "/about-us/about",
  };

  return { route: routes[origin], label: labels[origin] };
}
