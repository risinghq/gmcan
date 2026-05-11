import { Routes } from "@angular/router";

import { aboutUsResolver, facilitiesResolver, linesResolver, methodsResolver, worksResolver } from "./about/resolvers";
import { detailNewsResolver } from "./detail-news/resolver";
import { globalSearchResolver } from "./global-search/resolver";
import { homeResolver } from "./home/resolver";
import { projectsResolver } from "./projects/resolver";
import { publicationResolver } from "./publication/resolver";

export default [
  {
    path: "",
    loadComponent: () => import("./landing/component"),
    children: [
      {
        path: "",
        loadComponent: () => import("./home/component"),
        resolve: { home: homeResolver },
      },
      {
        path: "publications",
        loadComponent: () => import("./publication/component"),
        resolve: { publications: publicationResolver },
      },
      { path: "news", loadComponent: () => import("./main-news/component") },
      { path: "members", loadComponent: () => import("./members/component") },
      {
        path: "projects",
        loadComponent: () => import("./projects/component"),
        resolve: { projects: projectsResolver },
      },
      {
        path: "about-us",
        loadComponent: () => import("./about/component"),
        children: [
          {
            path: "",
            loadComponent: () => import("./about/about-us/component"),
            resolve: { aboutus: aboutUsResolver },
          },
          {
            path: "about",
            loadComponent: () => import("./about/about-us/component"),
            resolve: { aboutus: aboutUsResolver },
          },
          {
            path: "lines-investigation",
            loadComponent: () => import("./about/lines-investigation/component"),
            resolve: { lineasProyecto: linesResolver },
          },
          {
            path: "methods",
            loadComponent: () => import("./about/method/component"),
            resolve: { methods: methodsResolver },
          },
          {
            path: "facilities-resources",
            loadComponent: () => import("./about/facilities/component"),
            resolve: { facilities: facilitiesResolver },
          },
          { path: "works", loadComponent: () => import("./about/works/component"), resolve: { info: worksResolver } },
        ],
      },
      {
        path: "detail-news/:id",
        loadComponent: () => import("./detail-news/component"),
        resolve: { news: detailNewsResolver },
      },
      { path: "detail-member/:id", loadComponent: () => import("./detail-member/component") },
      {
        path: "search/:id",
        loadComponent: () => import("./global-search/component"),
        resolve: { search: globalSearchResolver },
      },
      { path: "join-us", loadComponent: () => import("./join-us/component") },
    ],
  },
] satisfies Routes;
