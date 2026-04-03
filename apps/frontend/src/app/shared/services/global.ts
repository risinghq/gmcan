import { environment } from "../../../environments/environment";

export const GLOBAL = {
  get url(): string {
    const apiUrl = environment.apiUrl;
    if (!apiUrl) {
      throw new Error("API URL not configured in environment");
    }
    return apiUrl;
  },
  get appUrl(): string {
    return environment.appUrl;
  },
};
