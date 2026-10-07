import { env } from "./config/env.js";

const FRONTEND_URLS: Record<typeof env.NODE_ENV, string> = {
  production: "https://gmcan.unmsm.edu.pe",
  development: "http://localhost:4200",
  test: "http://localhost:4200",
};

const LOCAL_BACKEND_URL = "http://localhost:3000";

export function getFrontendUrl(): string {
  return env.FRONTEND_URL ?? FRONTEND_URLS[env.NODE_ENV];
}

export function getBackendUrl(): string {
  return (env.BACKEND_URL ?? LOCAL_BACKEND_URL).replace(/\/+$/, "");
}
