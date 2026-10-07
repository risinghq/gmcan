import type { Context, Next } from "hono";

/** How long a shared cache or browser may serve public content without asking the API again. */
export const PUBLIC_CACHE_CONTROL = "public, max-age=60";

/** Marks successful public reads cacheable unless the route chose its own policy, as assets do. */
export async function publicCache(c: Context, next: Next) {
  await next();
  if (c.req.method === "GET" && c.res.status === 200 && !c.res.headers.has("Cache-Control")) {
    c.header("Cache-Control", PUBLIC_CACHE_CONTROL);
  }
}
