import { Routes } from "@angular/router";

export default [
  {
    path: "",
    loadComponent: () => import("./landing/landing.component"),
    children: [
      { path: "", loadComponent: () => import("./home/home.component") },
      { path: "publications", loadComponent: () => import("./publication/publication.component") },
      { path: "news", loadComponent: () => import("./main-news/main-news.component") },
      { path: "members", loadComponent: () => import("./members/members.component") },
      { path: "projects", loadComponent: () => import("./projects/projects.component") },
      {
        path: "about-us",
        loadComponent: () => import("./about/about.component"),
        children: [
          { path: "", loadComponent: () => import("./about/about-us/about-us.component") },
          { path: "about", loadComponent: () => import("./about/about-us/about-us.component") },
          {
            path: "lines-investigation",
            loadComponent: () => import("./about/lines-investigation/lines-investigation.component"),
          },
          { path: "methods", loadComponent: () => import("./about/method/method.component") },
          { path: "facilities-resources", loadComponent: () => import("./about/facilities/facilities.component") },
          { path: "works", loadComponent: () => import("./about/works/works.component") },
        ],
      },
      { path: "detail-news/:id", loadComponent: () => import("./detail-news/detail-news.component") },
      { path: "detail-member/:id", loadComponent: () => import("./detail-member/detail-member.component") },
      { path: "search/:id", loadComponent: () => import("./global-search/global-search.component") },
      { path: "join-us", loadComponent: () => import("./join-us/join-us.component") },
    ],
  },
] satisfies Routes;
