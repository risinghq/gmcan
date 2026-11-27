import { Routes } from "@angular/router";
import { pageTitle } from "@app/shared/routing/page-title";

export const routes: Routes = [
  { path: "dashboard", loadChildren: () => import("./dashboard/dashboard.routes") },
  { path: "login", loadComponent: () => import("./auth/login/login.component") },
  {
    path: "error",
    loadComponent: () => import("./shared/app-error/component"),
    title: pageTitle("errorTitle"),
  },
  { path: "reset-password", loadComponent: () => import("./auth/change-pass/change-pass.component") },
  { path: "", loadChildren: () => import("./public/public.routes") },
];
