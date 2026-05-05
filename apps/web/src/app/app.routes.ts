import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "home" },
  { path: "home", loadChildren: () => import("./public/public.routes") },
  { path: "dashboard", loadChildren: () => import("./dashboard/dashboard.routes") },
  { path: "login", loadComponent: () => import("./auth/login/login.component") },
  { path: "reset-password", loadComponent: () => import("./auth/change-pass/change-pass.component") },
  { path: "mantenimiento", loadComponent: () => import("./shared/mantenimiento/mantenimiento.component") },
  { path: "**", loadComponent: () => import("./shared/not-found/not-found.component") },
];
