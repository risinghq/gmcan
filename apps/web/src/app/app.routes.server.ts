import { RenderMode, ServerRoute } from "@angular/ssr";

// Rendering a page on the server costs far more CPU than the Workers free plan allows per request (10 ms).
// On the paid plan, set the last two routes to RenderMode.Server to render public pages on the server.
export const serverRoutes: ServerRoute[] = [
  {
    path: "**",
    renderMode: RenderMode.Client,
  },
];
