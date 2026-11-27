import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { publicationDisplay } from "@app/shared/publication-display";
import type { LookupService } from "@app/shared/services/lookup.service";
import type { PublicPublication } from "@gmcan/contracts/public";
import { describe, expect, it } from "vitest";

import { PublicationItemComponent } from "./publication-item.component";

const lookup = {
  publicationKinds: () => [{ code: "journal_article", name: "Artículo" }],
  thesisKinds: () => [],
  journals: () => [{ id: 7, name: "Nano Letters" }],
  universities: () => [],
  events: () => [],
} as unknown as LookupService;

function article(issue: number | null, abstract: string | null): PublicPublication {
  return {
    id: 1,
    title: "Nanotubes",
    asset: null,
    abstract,
    doi: "10.1000/xyz",
    publishedAt: "2024-03-15",
    kindCode: "journal_article",
    subtype: { kindCode: "journal_article", journalArticle: { journalId: 7, issue } },
    updatedAt: null,
    createdAt: null,
  };
}

async function render(publication: PublicPublication) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(PublicationItemComponent);
  fixture.componentRef.setInput("publication", publicationDisplay(lookup, "es")(publication));
  fixture.componentRef.setInput("from", "search");
  await fixture.whenStable();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

describe("publicationDisplay", () => {
  it("names the journal with its volume", () => {
    expect(publicationDisplay(lookup, "es")(article(12, null)).venue).toBe("Nano Letters Vol. 12");
  });

  it("names the journal alone when the issue is unknown", () => {
    expect(publicationDisplay(lookup, "es")(article(null, null)).venue).toBe("Nano Letters");
  });
});

describe("PublicationItemComponent", () => {
  it("offers no toggle when the publication has no abstract", async () => {
    const { element } = await render(article(12, null));

    expect(element.querySelector(".expand-toggle")).toBeNull();
    expect(element.querySelector(".abstract")).toBeNull();
  });

  it("reveals the abstract when the toggle is pressed", async () => {
    const { fixture, element } = await render(article(12, "About nanotubes."));
    const toggle = element.querySelector<HTMLButtonElement>(".expand-toggle");
    const abstract = element.querySelector<HTMLElement>(".abstract");

    expect(toggle?.getAttribute("aria-expanded")).toBe("false");
    expect(abstract?.hidden).toBe(true);

    toggle?.click();
    await fixture.whenStable();

    expect(toggle?.getAttribute("aria-expanded")).toBe("true");
    expect(abstract?.hidden).toBe(false);
    expect(toggle?.getAttribute("aria-controls")).toBe(abstract?.id);
  });

  it("links the DOI through doi.org", async () => {
    const { element } = await render(article(12, null));

    expect(element.querySelector(".doi a")?.getAttribute("href")).toBe("https://doi.org/10.1000/xyz");
  });
});
