import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import type { PublicNewsListItem } from "@app/shared/models/news";
import { NewsService } from "@app/shared/services/news.service";
import { of } from "rxjs";
import { describe, expect, it } from "vitest";

import NewsComponent from "./news.component";

function newsItem(id: number): PublicNewsListItem {
  return {
    id,
    title: `Noticia ${id}`,
    summary: "",
    publishedAt: `2024-06-${String(30 - id).padStart(2, "0")}`,
    asset: id % 2 === 0 ? `/assets/news-${id}.webp` : null,
    priority: null,
    authorId: 1,
    newsKindCode: "research",
    authorName: "Ana Torres",
    authorPhotoUrl: null,
    authorPhotoAlt: "",
    newsKindName: "Investigación",
  };
}

function render(count: number) {
  const items = Array.from({ length: count }, (_, index) => newsItem(index + 1));
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: NewsService, useValue: { listNews: () => of({ items, total: count, page: 1, pageSize: 30 }) } },
    ],
  });
  const fixture = TestBed.createComponent(NewsComponent);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe("NewsComponent", () => {
  it("renders the newest item as featured and at most ten more", () => {
    const element = render(14);

    expect(element.querySelector(".featured-news .news-link")?.textContent?.trim()).toBe("Noticia 1");
    const rows = [...element.querySelectorAll(".other-news")];
    expect(rows).toHaveLength(10);
    expect(rows[0].querySelector(".news-link")?.textContent?.trim()).toBe("Noticia 2");
  });

  it("puts the type and date on one meta line with a machine-readable date", () => {
    const meta = render(2).querySelector(".other-news .news-meta");

    expect(meta?.querySelector(".news-type")?.textContent).toBe("Investigación");
    expect(meta?.querySelector("time")?.getAttribute("datetime")).toBe("2024-06-28");
  });

  it("gives each row one link and an image box only when it has an image", () => {
    const rows = [...render(4).querySelectorAll(".other-news")];

    for (const row of rows) {
      expect(row.querySelectorAll("a")).toHaveLength(1);
    }
    expect(rows.map((row) => row.querySelector(".other-news-img img")?.getAttribute("src") ?? null)).toEqual([
      "/assets/news-2.webp",
      null,
      "/assets/news-4.webp",
    ]);
  });
});
