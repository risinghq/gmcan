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
  if (!environment.apiUrl) throw new Error("apiUrl is required: set it to the public URL of the API.");
  if (!environment.appUrl) throw new Error("appUrl is required: set it to the public URL of this site.");
}
