import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { NewsService } from "@app/shared/services/news.service";
import { of } from "rxjs";
import { describe, expect, it } from "vitest";

import DetailNewsComponent from "./component";
import type { DetailNewsViewModel } from "./types";

const NEWS: DetailNewsViewModel = {
  newsItem: {
    id: 60,
    title: "Integración de Dinámica Molecular",
    summary: "Resumen",
    publishedAt: "2024-06-11",
    asset: null,
    priority: null,
    authorId: 4,
    newsKindCode: "event",
    authorName: "Chachi Rojas Ayala",
    authorPhotoUrl: null,
    authorPhotoAlt: "",
    newsKindName: "Evento",
    body: "<p>Cuerpo</p>",
    statusCode: "published",
    updatedAt: null,
    createdAt: null,
  },
  publishedAtLabel: "11 de junio de 2024",
};

describe("DetailNewsComponent", () => {
  it("shows the author with the same kind and date line the news lists use", async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: NewsService, useValue: { listNews: () => of({ items: [], total: 0, page: 1, pageSize: 30 }) } },
      ],
    });
    const fixture = TestBed.createComponent(DetailNewsComponent);
    fixture.componentRef.setInput("news", NEWS);
    await fixture.whenStable();
    const author = (fixture.nativeElement as HTMLElement).querySelector(".author-text");

    expect(author?.querySelector(".author-name")?.textContent?.trim()).toBe("Chachi Rojas Ayala");
    expect(author?.querySelector("app-news-meta .type")?.textContent).toBe("Evento");
    expect(author?.querySelector("app-news-meta time")?.getAttribute("datetime")).toBe("2024-06-11");
    expect(author?.querySelector("app-news-meta time")?.textContent).toBe("11 de junio de 2024");
  });
});
