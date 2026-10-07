import { env } from "./config/env.js";

const FRONTEND_URLS: Record<typeof env.NODE_ENV, string> = {
  production: "https://gmcan.unmsm.edu.pe",
  development: "http://localhost:4200",
  test: "http://localhost:4200",
};

const LOCAL_BACKEND_URL = "http://localhost:3000";

type UrlEnv = Pick<typeof env, "NODE_ENV" | "FRONTEND_URL" | "BACKEND_URL">;

export function resolveFrontendUrl(config: UrlEnv): string {
  return config.FRONTEND_URL ?? FRONTEND_URLS[config.NODE_ENV];
}

export function resolveBackendUrl(config: UrlEnv): string {
  return (config.BACKEND_URL ?? LOCAL_BACKEND_URL).replace(/\/+$/, "");
}

export function getFrontendUrl(): string {
  return resolveFrontendUrl(env);
}

export function getBackendUrl(): string {
  return resolveBackendUrl(env);
}
