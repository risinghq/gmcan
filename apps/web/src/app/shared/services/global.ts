import { environment } from "../../../environments/environment";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function stripLeadingSlash(value: string): string {
  return value.replace(/^\/+/, "");
}

function joinUrl(base: string, path: string): string {
  return `${trimTrailingSlash(base)}/${stripLeadingSlash(path)}`;
}

export const GLOBAL = {
  get url(): string {
    const apiUrl = environment.apiUrl;
    if (!apiUrl) {
      throw new Error("API URL not configured in environment");
    }
    return trimTrailingSlash(apiUrl);
  },
  get appUrl(): string {
    return trimTrailingSlash(environment.appUrl);
  },
  api(path: string): string {
    return joinUrl(this.url, `api/${path}`);
  },
  admin(path: string): string {
    return joinUrl(this.url, `admin/${path}`);
  },
  app(path: string): string {
    return joinUrl(this.appUrl, path);
  },
  isPublicApiRequest(url: string): boolean {
    return url.startsWith(`${this.url}/api/`);
  },
};
