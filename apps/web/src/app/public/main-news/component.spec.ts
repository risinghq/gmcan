import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import type { PublicNewsListItem } from "@app/shared/models/news";
import { LookupService } from "@app/shared/services/lookup.service";
import { NewsService } from "@app/shared/services/news.service";
import { of } from "rxjs";
import { describe, expect, it } from "vitest";

import MainNewsComponent from "./component";

function newsItem(id: number, asset: string | null): PublicNewsListItem {
  return {
    id,
    title: `Noticia ${id}`,
    summary: "Resumen",
    publishedAt: "2024-06-11",
    asset,
    priority: null,
    authorId: 1,
    newsKindCode: "event",
    authorName: "Ana Torres",
    authorPhotoUrl: null,
    authorPhotoAlt: "",
    newsKindName: "Evento",
  };
}

async function render(items: PublicNewsListItem[]) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: LookupService, useValue: { newsKinds: () => [] } },
      { provide: NewsService, useValue: { listNews: () => of({ items, total: items.length, page: 1, pageSize: 10 }) } },
    ],
  });
  const fixture = TestBed.createComponent(MainNewsComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe("MainNewsComponent", () => {
  it("gives each item one link, one meta line and an image only when it has one", async () => {
    const element = await render([newsItem(1, "/assets/news-1.webp"), newsItem(2, null)]);
    const rows = [...element.querySelectorAll("article.news")];

    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row.querySelectorAll("a")).toHaveLength(1);
      expect(row.querySelector(".news-meta .type")?.textContent).toBe("Evento");
      expect(row.querySelector(".news-meta time")?.getAttribute("datetime")).toBe("2024-06-11");
    }
    expect(rows.map((row) => row.querySelectorAll("img").length)).toEqual([1, 0]);
  });
});
