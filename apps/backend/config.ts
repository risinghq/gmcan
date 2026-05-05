import { env } from "./config/env.js";

export function getFrontendUrl(): string {
  return env.FRONTEND_URL;
}

export function getBackendUrl(): string {
  return env.BACKEND_URL;
}
