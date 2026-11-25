import type { Capability } from "@app/shared/models/capabilities";

export interface NavLink {
  path: string;
  label: string;
  icon: string;
  capability?: Capability;
}

export interface NavSection {
  title?: string;
  links: NavLink[];
}

/** The dashboard sidebar. A link without a capability is shown to every signed-in member. */
export const DASHBOARD_NAV: NavSection[] = [
  {
    links: [
      { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
      { path: "/dashboard/news", label: "Noticias", icon: "chrome_reader_mode", capability: "news.write" },
    ],
  },
  {
    title: "Miembros",
    links: [
      { path: "/dashboard/miembros-activos", label: "Miembros Activos", icon: "group", capability: "members.read" },
      { path: "/dashboard/miembros-antiguos", label: "Miembros antiguos", icon: "history", capability: "members.read" },
    ],
  },
  {
    title: "Publicaciones",
    links: [
      { path: "/dashboard/articulos", label: "Artículos", icon: "article", capability: "publications.write" },
      { path: "/dashboard/tesis", label: "Tesis", icon: "school", capability: "publications.write" },
      { path: "/dashboard/eventos", label: "Resumen en eventos", icon: "event", capability: "publications.write" },
    ],
  },
  {
    title: "Proyectos",
    links: [
      {
        path: "/dashboard/proyectos-ejecucion",
        label: "Proyectos en ejecución",
        icon: "pending_actions",
        capability: "projects.write",
      },
      {
        path: "/dashboard/proyectos-concluidos",
        label: "Proyectos concluidos",
        icon: "task_alt",
        capability: "projects.write",
      },
    ],
  },
  {
    title: "Mi perfil",
    links: [
      { path: "/dashboard/perfil", label: "Mi información personal", icon: "person" },
      { path: "/dashboard/my-articles", label: "Mis artículos", icon: "article" },
      { path: "/dashboard/my-thesis", label: "Mis tesis", icon: "school" },
      { path: "/dashboard/my-abstracts", label: "Mis resúmenes en eventos", icon: "event" },
    ],
  },
  {
    links: [{ path: "/dashboard/contenidos", label: "Contenidos", icon: "description", capability: "content.write" }],
  },
];

/** The sections with the links the member may open; a section left with none is dropped. */
export function visibleNav(nav: NavSection[], can: (capability: Capability) => boolean): NavSection[] {
  return nav
    .map((section) => ({
      ...section,
      links: section.links.filter((link) => !link.capability || can(link.capability)),
    }))
    .filter((section) => section.links.length > 0);
}
