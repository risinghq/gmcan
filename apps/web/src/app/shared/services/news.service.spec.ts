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

  it("leaves unset filters out of the public list request", () => {
    news
      .listNews({ newsKindCode: undefined, sortBy: "publishedAt", sortOrder: "desc", page: 1, pageSize: 10 })
      .subscribe();

    const request = http.expectOne((req) => req.url === "https://api.example.test/api/news");
    expect(request.request.params.has("newsKindCode")).toBe(false);
    expect(request.request.params.get("page")).toBe("1");
    request.flush({ items: [], total: 0, page: 1, pageSize: 10 });
  });

  it("sends a chosen category", () => {
    news.listNews({ newsKindCode: "event" }).subscribe();

    const request = http.expectOne((req) => req.url === "https://api.example.test/api/news");
    expect(request.request.params.get("newsKindCode")).toBe("event");
    request.flush({ items: [], total: 0, page: 1, pageSize: 10 });
  });
});
