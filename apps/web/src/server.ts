import { AngularAppEngine, createRequestHandler } from "@angular/ssr";

import { cachedApiFetch, type ServiceBinding, type WorkerContext } from "./api-cache";
import { applyRuntimeConfig, currentRuntimeConfig } from "./runtime-config";

interface WebEnv {
  /** The API worker served under /api and /admin so the browser stays on one origin. */
  API?: ServiceBinding;
  ASSETS?: ServiceBinding;
  /** The site's canonical public URL, defaulting to the request origin. */
  APP_URL?: string;
}

// Cloudflare reports the scheme after terminating TLS.
// The host always comes from the request itself.
const engine = new AngularAppEngine({ trustProxyHeaders: ["x-forwarded-proto"] });
const nativeFetch = globalThis.fetch.bind(globalThis);
let routedOrigin: string | undefined;

function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/") || pathname.startsWith("/admin/");
}

/** Routes SSR calls for the site's origin to the API worker's service binding. */
function routeApiCalls(env: WebEnv, origin: string): void {
  const api = env.API;
  if (!api || routedOrigin === origin) return;
  routedOrigin = origin;
  globalThis.fetch = async (input, init) => {
    // The Workers runtime rejects the `credentials` option.
    const { credentials: _credentials, ...rest } = init ?? {};
    const request = new Request(input, rest);
    const url = new URL(request.url);
    if (url.origin === origin && isApiPath(url.pathname)) return api.fetch(request);
    return nativeFetch(request);
  };
}

async function handle(request: Request, env: WebEnv = {}, ctx?: WorkerContext): Promise<Response> {
  const url = new URL(request.url);
  const origin = env.APP_URL ?? url.origin;
  if (env.API) applyRuntimeConfig({ apiUrl: origin, appUrl: origin });

  if (url.pathname === "/config.json") {
    return Response.json(currentRuntimeConfig(), { headers: { "Cache-Control": "no-store" } });
  }
  if (env.API && isApiPath(url.pathname)) {
    return cachedApiFetch(request, env.API, (caches as unknown as { default: Cache }).default, ctx);
  }

  routeApiCalls(env, origin);
  const response = await engine.handle(request);
  if (response) return response;
  return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not found", { status: 404 });
}

export const reqHandler = createRequestHandler((request) => handle(request));

export default { fetch: handle };
