import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { environment } from "../../../environments/environment";
import { NewsService } from "./news.service";

describe("NewsService", () => {
  const original = environment.apiUrl;
  let http: HttpTestingController;
  let news: NewsService;

  beforeEach(() => {
    environment.apiUrl = "https://api.example.test";
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    news = TestBed.inject(NewsService);
  });

  afterEach(() => {
    environment.apiUrl = original;
    http.verify();
  });

  it("sends the chosen filters and leaves unset ones out of the public list request", () => {
    news.listNews({ newsKindCode: undefined, page: 1 }).subscribe();
    const unset = http.expectOne((req) => req.url === "https://api.example.test/api/news");
    expect(unset.request.params.has("newsKindCode")).toBe(false);
    expect(unset.request.params.get("page")).toBe("1");
    unset.flush({ items: [], total: 0, page: 1, pageSize: 10 });

    news.listNews({ newsKindCode: "event" }).subscribe();
    const chosen = http.expectOne((req) => req.url === "https://api.example.test/api/news");
    expect(chosen.request.params.get("newsKindCode")).toBe("event");
    chosen.flush({ items: [], total: 0, page: 1, pageSize: 10 });
  });
});
