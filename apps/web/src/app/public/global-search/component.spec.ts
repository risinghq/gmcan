import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, provideRouter } from "@angular/router";
import type { LookupData } from "@app/shared/models/lookup";
import { LookupService } from "@app/shared/services/lookup.service";
import type { GlobalSearchResults } from "@gmcan/contracts/public";
import { BehaviorSubject } from "rxjs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { environment } from "../../../environments/environment";
import GlobalSearchComponent from "./component";

type Publication = GlobalSearchResults["publications"][number];

const EMPTY: GlobalSearchResults = { publications: [], members: [], news: [], projects: [] };

function article(id: number, title: string): Publication {
  return {
    id,
    title,
    asset: null,
    abstract: null,
    doi: null,
    publishedAt: "2024-03-15",
    kindCode: "journal_article",
    subtype: { kindCode: "journal_article", journalArticle: { journalId: 7, issue: 12 } },
    authors: [{ kind: "external", authorOrder: 1, name: "Ana Torres" }],
  };
}

function newsItem(id: number, asset: string | null): GlobalSearchResults["news"][number] {
  return {
    id,
    title: `Noticia ${id}`,
    publishedAt: "2024-06-11",
    asset,
    newsKindCode: "event",
    statusCode: "published",
    authorName: "Ana Torres",
  };
}

function thesis(id: number, title: string): Publication {
  return {
    ...article(id, title),
    kindCode: "thesis",
    subtype: { kindCode: "thesis", thesis: { universityId: 3, thesisKindCode: "phd" } },
  };
}

describe("GlobalSearchComponent", () => {
  const original = environment.apiUrl;
  const data = new BehaviorSubject<{ search: GlobalSearchResults }>({ search: EMPTY });
  const params = new BehaviorSubject<{ id: string }>({ id: "" });
  let fixture: ComponentFixture<GlobalSearchComponent>;

  const page = () => fixture.nativeElement as HTMLElement;
  const texts = (selector: string) =>
    [...page().querySelectorAll(selector)].map((element) => element.textContent?.trim());

  async function search(term: string, results: GlobalSearchResults) {
    params.next({ id: term });
    data.next({ search: results });
    await fixture.whenStable();
  }

  beforeEach(async () => {
    environment.apiUrl = "https://api.example.test";
    data.next({ search: EMPTY });
    params.next({ id: "" });
    TestBed.configureTestingModule({
      imports: [GlobalSearchComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { data, params, snapshot: { queryParamMap: convertToParamMap({ from: "news" }) } },
        },
      ],
    });

    const lookup = TestBed.inject(LookupService);
    const loaded = lookup.load();
    TestBed.inject(HttpTestingController)
      .expectOne("https://api.example.test/api/lookup")
      .flush({
        publicationKinds: [{ code: "journal_article", name: "Artículo" }],
        thesisKinds: [{ code: "phd", name: "Tesis doctoral" }],
        journals: [{ id: 7, name: "Nano Letters" }],
        universities: [{ id: 3, name: "UNI" }],
        events: [],
        newsKinds: [{ code: "event", name: "Evento" }],
        currencies: [],
      } as Partial<LookupData>);
    await loaded;

    fixture = TestBed.createComponent(GlobalSearchComponent);
    await fixture.whenStable();
  });

  afterEach(() => {
    environment.apiUrl = original;
    TestBed.inject(HttpTestingController).verify();
  });

  it("links back to the page the search started from", () => {
    expect(page().querySelector("a[app-back-link]")?.getAttribute("href")).toBe("/news");
  });

  it("titles the page with a single h1", () => {
    expect(page().querySelectorAll("h1")).toHaveLength(1);
  });

  it("shows the not-found message when a search matches nothing", () => {
    expect(page().querySelector(".not-found")).not.toBeNull();
    expect(page().querySelector("app-publication-item")).toBeNull();
  });

  it("shows only the groups that matched, across the full width when one column is empty", async () => {
    await search("noticia", { ...EMPTY, news: [newsItem(1, null)] });

    expect(texts("h2.publications-title").map((text) => text?.split(/\s+/)[0])).toEqual(["Noticias"]);
    expect(page().querySelector("#news-list")?.parentElement?.className).not.toContain("col-lg-4");
    expect(page().querySelector(".not-found")).toBeNull();
  });

  it("names each publication's kind, journal and date from the lookup data", async () => {
    await search("nano", { ...EMPTY, publications: [article(1, "Nanotubes"), thesis(2, "Nanowires")] });

    expect(texts("app-publication-item .title")).toEqual(["Nanotubes", "Nanowires"]);
    expect(texts(".publication-kind")).toEqual(["Artículo", "Tesis doctoral"]);
    expect(texts("app-publication-item .meta")[0]).toContain("Nano Letters Vol. 12");
    expect(texts("app-publication-item .meta")[1]).toContain("UNI");
    expect(texts("app-publication-item .meta")[0]).toContain("Marzo 2024");
    expect(page().querySelector(".not-found")).toBeNull();
  });

  it("lists every news result as one link with its kind, date and an image only when it has one", async () => {
    const many = Array.from({ length: 7 }, (_, index) =>
      newsItem(index + 1, index === 0 ? "/assets/news-1.webp" : null),
    );
    await search("noticia", { ...EMPTY, news: many });
    const rows = [...page().querySelectorAll("#collapseNews .other-news")];

    expect(rows).toHaveLength(7);
    for (const row of rows) {
      expect(row.querySelectorAll("a")).toHaveLength(1);
      expect(row.querySelector(".type")?.textContent).toBe("Evento");
      expect(row.querySelector("time")?.getAttribute("datetime")).toBe("2024-06-11");
    }
    expect(rows.map((row) => row.querySelectorAll("img").length)).toEqual([1, 0, 0, 0, 0, 0, 0]);
  });

  it("replaces the results and the search box when the next search arrives", async () => {
    await search("nano", { ...EMPTY, publications: [article(1, "Nanotubes")] });
    await search("graphene", { ...EMPTY, publications: [article(3, "Graphene sheets")] });

    expect(texts("app-publication-item .title")).toEqual(["Graphene sheets"]);
    expect(page().querySelector<HTMLInputElement>("[role=search] input")?.value).toBe("graphene");
  });

  it("pages publications five at a time and starts a new search on the first page", async () => {
    const many = Array.from({ length: 7 }, (_, index) => article(index + 1, `Paper ${index + 1}`));
    await search("paper", { ...EMPTY, publications: many });
    expect(texts("app-publication-item .title")).toHaveLength(5);

    page().querySelector<HTMLAnchorElement>("#publications-list ngb-pagination li:nth-last-child(2) a")?.click();
    await fixture.whenStable();
    expect(texts("app-publication-item .title")).toEqual(["Paper 6", "Paper 7"]);

    await search("paper", { ...EMPTY, publications: many.slice(0, 6) });
    expect(texts("app-publication-item .title")).toEqual(["Paper 1", "Paper 2", "Paper 3", "Paper 4", "Paper 5"]);
  });
});
