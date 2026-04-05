import { Routes } from "@angular/router";

import { detailNewsResolver } from "./detail-news/detail-news.resolver";
import { globalSearchResolver } from "./global-search/global-search.resolver";
import { homeResolver } from "./home/home.resolver";
import { projectsResolver } from "./projects/projects.resolver";
import { publicationResolver } from "./publication/publication.resolver";

export default [
  {
    path: "",
    loadComponent: () => import("./landing/landing.component"),
    children: [
      {
        path: "",
        loadComponent: () => import("./home/home.component"),
        resolve: { home: homeResolver },
      },
      {
        path: "publications",
        loadComponent: () => import("./publication/publication.component"),
        resolve: { publications: publicationResolver },
      },
      { path: "news", loadComponent: () => import("./main-news/main-news.component") },
      { path: "members", loadComponent: () => import("./members/members.component") },
      {
        path: "projects",
        loadComponent: () => import("./projects/projects.component"),
        resolve: { projects: projectsResolver },
      },
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
      {
        path: "detail-news/:id",
        loadComponent: () => import("./detail-news/detail-news.component"),
        resolve: { news: detailNewsResolver },
      },
      { path: "detail-member/:id", loadComponent: () => import("./detail-member/detail-member.component") },
      {
        path: "search/:id",
        loadComponent: () => import("./global-search/global-search.component"),
        resolve: { search: globalSearchResolver },
      },
      { path: "join-us", loadComponent: () => import("./join-us/join-us.component") },
    ],
  },
] satisfies Routes;
