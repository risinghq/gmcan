import type { IconName } from "@app/shared/components/icon/icons";
import type { Capability } from "@app/shared/models/capabilities";

export interface NavLink {
  path: string;
  label: string;
  icon: IconName;
  capability?: Capability;
}

export interface NavSection {
  title?: string;
  links: NavLink[];
}

/** A link without a capability is shown to every signed-in member. */
export const DASHBOARD_NAV: NavSection[] = [
  {
    links: [
      { path: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
      { path: "/dashboard/news", label: "Noticias", icon: "news", capability: "news.write" },
    ],
  },
  {
    title: "Miembros",
    links: [
      { path: "/dashboard/miembros-activos", label: "Miembros Activos", icon: "users", capability: "members.read" },
      { path: "/dashboard/miembros-antiguos", label: "Miembros antiguos", icon: "history", capability: "members.read" },
    ],
  },
  {
    title: "Publicaciones",
    links: [
      { path: "/dashboard/articulos", label: "Artículos", icon: "article", capability: "publications.write" },
      { path: "/dashboard/tesis", label: "Tesis", icon: "school", capability: "publications.write" },
      {
        path: "/dashboard/eventos",
        label: "Resumen en eventos",
        icon: "calendar-event",
        capability: "publications.write",
      },
    ],
  },
  {
    title: "Proyectos",
    links: [
      {
        path: "/dashboard/proyectos-ejecucion",
        label: "Proyectos en ejecución",
        icon: "clock-edit",
        capability: "projects.write",
      },
      {
        path: "/dashboard/proyectos-concluidos",
        label: "Proyectos concluidos",
        icon: "circle-check",
        capability: "projects.write",
      },
    ],
  },
  {
    title: "Mi perfil",
    links: [
      { path: "/dashboard/perfil", label: "Mi información personal", icon: "user" },
      { path: "/dashboard/my-articles", label: "Mis artículos", icon: "article" },
      { path: "/dashboard/my-thesis", label: "Mis tesis", icon: "school" },
      { path: "/dashboard/my-abstracts", label: "Mis resúmenes en eventos", icon: "calendar-event" },
    ],
  },
  {
    links: [
      { path: "/dashboard/contenidos", label: "Contenidos", icon: "file-description", capability: "content.write" },
    ],
  },
];

/** A section left with no link the member may open is dropped. */
export function visibleNav(nav: NavSection[], can: (capability: Capability) => boolean): NavSection[] {
  return nav
    .map((section) => ({
      ...section,
      links: section.links.filter((link) => !link.capability || can(link.capability)),
    }))
    .filter((section) => section.links.length > 0);
}
