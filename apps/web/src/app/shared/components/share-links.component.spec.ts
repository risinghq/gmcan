import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";

import { ShareLinksComponent } from "./share-links.component";

function render() {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  const fixture = TestBed.createComponent(ShareLinksComponent);
  fixture.componentRef.setInput("url", "https://gmcan.example/detail-news/7");
  fixture.componentRef.setInput("title", "Dinámica & DFT");
  fixture.detectChanges();
  return [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>("a")];
}

describe("ShareLinksComponent", () => {
  it("renders each network as a labelled link that opens in a new tab", () => {
    const links = render();

    expect(links.map((link) => link.getAttribute("aria-label"))).toEqual([
      "Compartir en Facebook",
      "Compartir en X",
      "Compartir en LinkedIn",
      "Compartir en WhatsApp",
    ]);
    for (const link of links) {
      expect(link.target).toBe("_blank");
      expect(link.rel).toBe("noopener noreferrer");
    }
  });

  it("encodes the page url and title into each share url", () => {
    const [facebook, x, , whatsapp] = render().map((link) => new URL(link.href));

    expect(facebook.searchParams.get("u")).toBe("https://gmcan.example/detail-news/7");
    expect(x.searchParams.get("url")).toBe("https://gmcan.example/detail-news/7");
    expect(x.searchParams.get("text")).toBe("Dinámica & DFT");
    expect(whatsapp.searchParams.get("text")).toBe("Dinámica & DFT https://gmcan.example/detail-news/7");
  });
});
