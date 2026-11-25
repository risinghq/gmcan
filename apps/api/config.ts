import { AsyncLocalStorage } from "node:async_hooks";

import { env } from "./config/env.js";

const LOCAL_FRONTEND_URL = "http://localhost:4200";
const LOCAL_BACKEND_URL = "http://localhost:3000";

const requestOrigin = new AsyncLocalStorage<string>();

type UrlEnv = Pick<typeof env, "FRONTEND_URL">;

export function resolveFrontendUrl(config: UrlEnv): string {
  return config.FRONTEND_URL ?? LOCAL_FRONTEND_URL;
}

export function getFrontendUrl(): string {
  return resolveFrontendUrl(env);
}

/** Runs `next` with the request's origin as the base of the URLs the API returns. */
export function withRequestOrigin<T>(requestUrl: string, next: () => Promise<T>): Promise<T> {
  return requestOrigin.run(new URL(requestUrl).origin, next);
}

/**
 * The origin the client reached the API on: the site behind the web worker, or the API itself in development.
 * Outside a request it is the local API.
 */
export function getBackendUrl(): string {
  return requestOrigin.getStore() ?? LOCAL_BACKEND_URL;
}
