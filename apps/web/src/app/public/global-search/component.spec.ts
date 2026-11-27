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
        newsKinds: [],
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
    expect(page().querySelector("a.back-div")?.getAttribute("href")).toBe("/news");
  });

  it("shows the not-found message when a search matches nothing", () => {
    expect(page().querySelector(".not-found-2")).not.toBeNull();
    expect(page().querySelector(".publication")).toBeNull();
  });

  it("names each publication's kind, journal and date from the lookup data", async () => {
    await search("nano", { ...EMPTY, publications: [article(1, "Nanotubes"), thesis(2, "Nanowires")] });

    expect(texts(".publication-title")).toEqual(["Nanotubes", "Nanowires"]);
    expect(texts(".publication-type")).toEqual(["Artículo", "Tesis doctoral"]);
    expect(texts(".publication-rev")[0]).toContain("Nano Letters Vol. 12");
    expect(texts(".publication-rev")).toContain("UNI");
    expect(texts(".publication-date")).toContain("Marzo 2024");
    expect(page().querySelector(".not-found-2")).toBeNull();
  });

  it("replaces the results and the search box when the next search arrives", async () => {
    await search("nano", { ...EMPTY, publications: [article(1, "Nanotubes")] });
    await search("graphene", { ...EMPTY, publications: [article(3, "Graphene sheets")] });

    expect(texts(".publication-title")).toEqual(["Graphene sheets"]);
    expect(page().querySelector<HTMLInputElement>("[role=search] input")?.value).toBe("graphene");
  });

  it("pages publications five at a time and starts a new search on the first page", async () => {
    const many = Array.from({ length: 7 }, (_, index) => article(index + 1, `Paper ${index + 1}`));
    await search("paper", { ...EMPTY, publications: many });
    expect(texts(".publication-title")).toHaveLength(5);

    page().querySelector<HTMLAnchorElement>("#publications-list ngb-pagination li:nth-last-child(2) a")?.click();
    await fixture.whenStable();
    expect(texts(".publication-title")).toEqual(["Paper 6", "Paper 7"]);

    await search("paper", { ...EMPTY, publications: many.slice(0, 6) });
    expect(texts(".publication-title")).toEqual(["Paper 1", "Paper 2", "Paper 3", "Paper 4", "Paper 5"]);
  });
});
