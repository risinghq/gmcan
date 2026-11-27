import { inject } from "@angular/core";
import { Routes } from "@angular/router";
import { SessionService } from "@app/shared/services/session.service";

import { AboutDataService } from "./about/data";
import { detailMemberResolver } from "./detail-member/resolver";
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
        title: () => inject(SessionService).language().publications,
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
            resolve: { aboutus: () => inject(AboutDataService).getAbout() },
          },
          {
            path: "about",
            loadComponent: () => import("./about/about-us/component"),
            resolve: { aboutus: () => inject(AboutDataService).getAbout() },
          },
          {
            path: "lines-investigation",
            loadComponent: () => import("./about/lines-investigation/component"),
            resolve: { lineasProyecto: () => inject(AboutDataService).getLines() },
          },
          {
            path: "methods",
            loadComponent: () => import("./about/method/component"),
          },
          {
            path: "facilities-resources",
            loadComponent: () => import("./about/facilities/component"),
            resolve: { facilities: () => inject(AboutDataService).getFacilities() },
          },
          { path: "works", loadComponent: () => import("./about/works/component") },
        ],
      },
      {
        path: "detail-news/:id",
        loadComponent: () => import("./detail-news/component"),
        resolve: { news: detailNewsResolver },
      },
      {
        path: "detail-member/:id",
        loadComponent: () => import("./detail-member/component"),
        resolve: { profile: detailMemberResolver },
      },
      {
        path: "search/:id",
        loadComponent: () => import("./global-search/component"),
        resolve: { search: globalSearchResolver },
      },
      { path: "join-us", loadComponent: () => import("./join-us/component") },
      {
        path: "**",
        loadComponent: () => import("@app/shared/not-found/not-found.component"),
        title: () => inject(SessionService).language().notFound,
      },
    ],
  },
] satisfies Routes;
