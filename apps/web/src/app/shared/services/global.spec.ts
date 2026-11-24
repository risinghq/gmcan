import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { afterEach, describe, expect, it } from "vitest";

import { environment } from "../../../environments/environment";
import { GLOBAL } from "./global";
import { RefService } from "./ref.service";

const formats = [
  ["without a trailing slash", "https://api.example.test"],
  ["with a trailing slash", "https://api.example.test/"],
] as const;

describe.each(formats)("API_URL %s", (_label, apiUrl) => {
  const original = environment.apiUrl;

  afterEach(() => {
    environment.apiUrl = original;
  });

  it("builds admin and public URLs with exactly one slash", () => {
    environment.apiUrl = apiUrl;
    expect(GLOBAL.admin("ref/journal")).toBe("https://api.example.test/admin/ref/journal");
    expect(GLOBAL.api("news")).toBe("https://api.example.test/api/news");
    expect(GLOBAL.isPublicApiRequest(GLOBAL.api("news"))).toBe(true);
    expect(GLOBAL.isPublicApiRequest(GLOBAL.admin("ref/journal"))).toBe(false);
  });

  it("sends reference requests to the admin API", () => {
    environment.apiUrl = apiUrl;
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    const refs = TestBed.inject(RefService);

    refs.listJournals().subscribe();
    refs.deleteJournal(4).subscribe();

    http.expectOne({ method: "GET", url: "https://api.example.test/admin/ref/journal" });
    http.expectOne({ method: "DELETE", url: "https://api.example.test/admin/ref/journal/4" });
    http.verify();
  });
});
