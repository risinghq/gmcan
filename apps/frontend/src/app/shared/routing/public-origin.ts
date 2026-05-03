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

export function getPublicOriginInfo(origin: PublicOrigin, isEnglish: boolean): PublicOriginInfo {
  const labels = isEnglish
    ? {
        home: "Home",
        news: "News",
        members: "Members",
        projects: "Projects",
        publications: "Publications",
        search: "Search Results",
        about: "About Us",
      }
    : {
        home: "Inicio",
        news: "Noticias",
        members: "Miembros",
        projects: "Proyectos",
        publications: "Publicaciones",
        search: "Resultados de Búsqueda",
        about: "¿Quiénes Somos?",
      };

  const routes: Record<PublicOrigin, string> = {
    home: "/home",
    news: "/home/news",
    members: "/home/members",
    projects: "/home/projects",
    publications: "/home/publications",
    search: "/home",
    about: "/home/about-us/about",
  };

  return { route: routes[origin], label: labels[origin] };
}
