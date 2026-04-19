import { RenderMode, ServerRoute } from "@angular/ssr";

export const serverRoutes: ServerRoute[] = [
  {
    path: "dashboard/**",
    renderMode: RenderMode.Client,
  },
  {
    path: "login",
    renderMode: RenderMode.Client,
  },
  {
    path: "reset-password",
    renderMode: RenderMode.Client,
  },
  {
    path: "home/**",
    renderMode: RenderMode.Server,
  },
  {
    path: "**",
    renderMode: RenderMode.Server,
  },
];
