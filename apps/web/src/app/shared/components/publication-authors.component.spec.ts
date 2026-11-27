import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import type { PublicationAuthor } from "@gmcan/contracts/public";
import { describe, expect, it } from "vitest";

import { PublicationAuthorsComponent } from "./publication-authors.component";

const AUTHORS: PublicationAuthor[] = [
  { kind: "registered", authorOrder: 1, memberId: 4, name: "Justo Rojas Tapia", photoUrl: null, photoAlt: "" },
  { kind: "external", authorOrder: 2, name: "Ana Torres" },
];

async function render() {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(PublicationAuthorsComponent);
  fixture.componentRef.setInput("authors", AUTHORS);
  fixture.componentRef.setInput("from", "search");
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe("PublicationAuthorsComponent", () => {
  it("lists every author in order without separator punctuation", async () => {
    const element = await render();

    const names = [...element.querySelectorAll("li > :last-child")].map((item) => item.textContent);
    expect(names).toEqual(["Justo Rojas Tapia", "Ana Torres"]);
  });

  it("links a registered member to their profile with the page to return to", async () => {
    const element = await render();

    const links = element.querySelectorAll("a");
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe("/detail-member/4?from=search");
  });

  it("gives every author an avatar", async () => {
    const element = await render();

    expect(element.querySelectorAll("li app-avatar")).toHaveLength(2);
  });
});
