import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "dashboard", loadChildren: () => import("./dashboard/dashboard.routes") },
  { path: "login", loadComponent: () => import("./auth/login/login.component") },
  { path: "error", loadComponent: () => import("./shared/app-error/component") },
  { path: "reset-password", loadComponent: () => import("./auth/change-pass/change-pass.component") },
  { path: "mantenimiento", loadComponent: () => import("./shared/mantenimiento/mantenimiento.component") },
  { path: "", loadChildren: () => import("./public/public.routes") },
  { path: "**", loadComponent: () => import("./shared/not-found/not-found.component") },
];
