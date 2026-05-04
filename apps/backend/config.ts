const NODE_ENV = process.env.NODE_ENV ?? "development";

const FRONTEND_URLS: Record<string, string> = {
  production: "https://gmcan.unmsm.edu.pe",
  development: "http://localhost:4200",
};

const BACKEND_URLS: Record<string, string> = {
  production: "http://161.35.230.134:3000",
  development: "http://localhost:3000",
};

export function getFrontendUrl(): string {
  return FRONTEND_URLS[NODE_ENV] ?? FRONTEND_URLS["development"];
}

export function getBackendUrl(): string {
  return (process.env.BACKEND_URL ?? BACKEND_URLS[NODE_ENV] ?? BACKEND_URLS["development"]).replace(/\/+$/, "");
}
