import { Routes } from "@angular/router";
import { canDeactivateGuard } from "@app/shared/guards/deactivate.guard";

export default [
  {
    path: "",
    loadComponent: () => import("./shell/log-home.component"),
    children: [
      { path: "", loadComponent: () => import("./home/dashboard.component") },
      { path: "miembros-activos", loadComponent: () => import("./members/list/miembros.component") },
      { path: "miembros-antiguos", loadComponent: () => import("./members/list/miembros.component") },
      {
        path: "add-member",
        loadComponent: () => import("./members/add/add-member.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "edit-member/:id",
        loadComponent: () => import("./members/edit/edit-member.component"),
        canDeactivate: [canDeactivateGuard],
      },
      { path: "publicaciones", loadComponent: () => import("./publications/list/publicaciones.component") },
      { path: "proyectos-ejecucion", loadComponent: () => import("./projects/list/proyectos.component") },
      { path: "proyectos-concluidos", loadComponent: () => import("./projects/list/proyectos.component") },
      {
        path: "add-project",
        loadComponent: () => import("./projects/add/add-proyecto.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "edit-project/:id",
        loadComponent: () => import("./projects/edit/edit-proyecto.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "add-fuente",
        loadComponent: () => import("./projects/add-fuente/add-fuente.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "edit-fuente/:id",
        loadComponent: () => import("./projects/edit-fuente/edit-fuente.component"),
        canDeactivate: [canDeactivateGuard],
      },
      { path: "noticias", loadComponent: () => import("./news/list/noticias.component") },
      {
        path: "add-news",
        loadComponent: () => import("./news/add/add-news.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "edit-news/:id",
        loadComponent: () => import("./news/edit/edit-news.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "add-category",
        loadComponent: () => import("./news/add-category/add-category.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "edit-category/:id",
        loadComponent: () => import("./news/edit-category/edit-category.component"),
        canDeactivate: [canDeactivateGuard],
      },
      { path: "perfil", loadComponent: () => import("./profile/perfil.component") },
      { path: "contenidos", loadComponent: () => import("./content/list/contenidos.component") },
      {
        path: "add-linea",
        loadComponent: () => import("./content/add-linea/add-linea.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "edit-linea/:id",
        loadComponent: () => import("./content/edit-linea/edit-linea.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "add-method",
        loadComponent: () => import("./content/add-method/add-method.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "edit-method/:id",
        loadComponent: () => import("./content/edit-method/edit-method.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "add-equipo",
        loadComponent: () => import("./content/add-equipo/add-equipo.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "edit-equipo/:id",
        loadComponent: () => import("./content/edit-equipo/edit-equipo.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "add-software",
        loadComponent: () => import("./content/add-software/add-software.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "edit-software/:id",
        loadComponent: () => import("./content/edit-software/edit-software.component"),
        canDeactivate: [canDeactivateGuard],
      },
      { path: "articulos", loadComponent: () => import("./publications/articles-list/articulos.component") },
      {
        path: "add-article",
        loadComponent: () => import("./publications/add-article/add-article.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "edit-article/:id",
        loadComponent: () => import("./publications/edit-article/edit-article.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "add-revista",
        loadComponent: () => import("./publications/add-revista/add-revista.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "edit-revista/:id",
        loadComponent: () => import("./publications/edit-revista/edit-revista.component"),
        canDeactivate: [canDeactivateGuard],
      },
      { path: "tesis", loadComponent: () => import("./publications/tesis-list/tesis.component") },
      {
        path: "add-thesis",
        loadComponent: () => import("./publications/add-tesis/add-tesis.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "edit-thesis/:id",
        loadComponent: () => import("./publications/edit-tesis/edit-tesis.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "add-universidad",
        loadComponent: () => import("./publications/add-universidad/add-universidad.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "edit-universidad/:id",
        loadComponent: () => import("./publications/edit-universidad/edit-universidad.component"),
        canDeactivate: [canDeactivateGuard],
      },
      { path: "eventos", loadComponent: () => import("./events/list/eventos.component") },
      {
        path: "add-resumen",
        loadComponent: () => import("./events/add-resumen/add-resumen.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "edit-resumen/:id",
        loadComponent: () => import("./events/edit-resumen/edit-resumen.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "add-evento",
        loadComponent: () => import("./events/add/add-evento.component"),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: "edit-evento/:id",
        loadComponent: () => import("./events/edit/edit-evento.component"),
        canDeactivate: [canDeactivateGuard],
      },
      { path: "my-articles", loadComponent: () => import("./publications/my-articles/my-article.component") },
      { path: "my-thesis", loadComponent: () => import("./publications/my-thesis/my-thesis.component") },
      { path: "my-abstracts", loadComponent: () => import("./publications/my-resumenes/my-resumenes.component") },
      { path: "**", loadComponent: () => import("@app/shared/not-found/not-found.component") },
    ],
  },
] satisfies Routes;
