import { environment } from "./environments/environment";

export interface RuntimeConfig {
  apiUrl: string;
  appUrl: string;
}

export function currentRuntimeConfig(): RuntimeConfig {
  return { apiUrl: environment.apiUrl, appUrl: environment.appUrl };
}

/** Overrides the build's environment with the given values. Throws when a URL is still empty. */
export function applyRuntimeConfig(config: Partial<RuntimeConfig>): void {
  if (config.apiUrl) environment.apiUrl = config.apiUrl;
  if (config.appUrl) environment.appUrl = config.appUrl;
  if (!environment.apiUrl) throw new Error("API_URL is required: set it to the public URL of the API.");
  if (!environment.appUrl) throw new Error("APP_URL is required: set it to the public URL of this site.");
}

/** Applies the server's environment at startup. A production server must set every variable it needs. */
export function applyServerEnv(env: Record<string, string | undefined>): void {
  applyRuntimeConfig({ apiUrl: env["API_URL"], appUrl: env["APP_URL"] });
  if (environment.production && !env["NG_ALLOWED_HOSTS"]) {
    throw new Error(
      "NG_ALLOWED_HOSTS is required in production: set it to the comma-separated hosts this site serves.",
    );
  }
}
