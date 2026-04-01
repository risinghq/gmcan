const NODE_ENV = process.env.NODE_ENV ?? "development";

const FRONTEND_URLS: Record<string, string> = {
  production: "https://gmcan.unmsm.edu.pe",
  development: "http://localhost:4200",
};

export function getFrontendUrl(): string {
  return FRONTEND_URLS[NODE_ENV] ?? FRONTEND_URLS["development"];
}
