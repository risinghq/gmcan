import { env } from "./config/env.js";

const FRONTEND_URLS: Record<typeof env.NODE_ENV, string> = {
  production: "https://gmcan.unmsm.edu.pe",
  development: "http://localhost:4200",
  test: "http://localhost:4200",
};

const BACKEND_URLS: Record<typeof env.NODE_ENV, string> = {
  production: "http://161.35.230.134:3000",
  development: "http://localhost:3000",
  test: "http://localhost:3000",
};

export function getFrontendUrl(): string {
  return env.FRONTEND_URL ?? FRONTEND_URLS[env.NODE_ENV];
}

export function getBackendUrl(): string {
  return (env.BACKEND_URL ?? BACKEND_URLS[env.NODE_ENV]).replace(/\/+$/, "");
}
