import { inject } from "@angular/core";
import { Routes } from "@angular/router";
import type { Derive } from "@app/shared/routing/derived-data";
import { pageTitle } from "@app/shared/routing/page-title";
import { personName } from "@app/shared/utils/person-name";
import type { PublicMemberProfile } from "@gmcan/contracts/public";

import { AboutDataService } from "./about/data";
import { detailMemberResolver } from "./detail-member/resolver";
import { detailNewsResolver } from "./detail-news/resolver";
import type { DetailNewsViewModel } from "./detail-news/types";
import { globalSearchResolver } from "./global-search/resolver";
import { homeResolver } from "./home/resolver";
import { projectsResolver } from "./projects/resolver";
import { publicationResolver } from "./publication/resolver";

const newsTitle: Derive<string> = (data) => (data["news"] as DetailNewsViewModel).newsItem.title;
const memberTitle: Derive<string> = (data) => personName((data["profile"] as PublicMemberProfile).member);
const searchTitle: Derive<string> = (_data, route) => route.paramMap.get("id") ?? "";

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
        title: pageTitle("publications"),
      },
      { path: "news", loadComponent: () => import("./main-news/component"), title: pageTitle("news") },
      { path: "members", loadComponent: () => import("./members/component"), title: pageTitle("members") },
      {
        path: "projects",
        loadComponent: () => import("./projects/component"),
        resolve: { projects: projectsResolver },
        title: pageTitle("projects"),
      },
      {
        path: "about-us",
        loadComponent: () => import("./about/component"),
        children: [
          {
            path: "",
            loadComponent: () => import("./about/about-us/component"),
            resolve: { aboutus: () => inject(AboutDataService).getAbout() },
            title: pageTitle("who"),
          },
          {
            path: "about",
            loadComponent: () => import("./about/about-us/component"),
            resolve: { aboutus: () => inject(AboutDataService).getAbout() },
            title: pageTitle("who"),
          },
          {
            path: "lines-investigation",
            loadComponent: () => import("./about/lines-investigation/component"),
            resolve: { lineasProyecto: () => inject(AboutDataService).getLines() },
            title: pageTitle("linesInvestigation"),
          },
          {
            path: "methods",
            loadComponent: () => import("./about/method/component"),
            title: pageTitle("methods"),
          },
          {
            path: "facilities-resources",
            loadComponent: () => import("./about/facilities/component"),
            resolve: { facilities: () => inject(AboutDataService).getFacilities() },
            title: pageTitle("resources"),
          },
          { path: "works", loadComponent: () => import("./about/works/component"), title: pageTitle("futureWorks") },
        ],
      },
      {
        path: "detail-news/:id",
        loadComponent: () => import("./detail-news/component"),
        resolve: { news: detailNewsResolver },
        data: { pageTitle: newsTitle },
      },
      {
        path: "detail-member/:id",
        loadComponent: () => import("./detail-member/component"),
        resolve: { profile: detailMemberResolver },
        data: { pageTitle: memberTitle },
      },
      {
        path: "search/:id",
        loadComponent: () => import("./global-search/component"),
        resolve: { search: globalSearchResolver },
        data: { pageTitle: searchTitle },
      },
      { path: "join-us", loadComponent: () => import("./join-us/component"), title: pageTitle("join") },
      {
        path: "**",
        loadComponent: () => import("@app/shared/not-found/not-found.component"),
        title: pageTitle("notFound"),
      },
    ],
  },
] satisfies Routes;
