import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";

import { NewsMetaComponent } from "./news-meta.component";

function render(type: string) {
  const fixture = TestBed.createComponent(NewsMetaComponent);
  fixture.componentRef.setInput("type", type);
  fixture.componentRef.setInput("date", "2022-11-10");
  fixture.componentRef.setInput("label", "10 de noviembre de 2022");
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe("NewsMetaComponent", () => {
  it("keeps the separator on the kind's line so a wrap breaks inside the date", () => {
    const meta = render("Investigación");

    expect(meta.textContent?.trim()).toBe("Investigación · 10 de noviembre de 2022");
    expect(meta.querySelector("time")?.getAttribute("datetime")).toBe("2022-11-10");
  });

  it("shows only the date when the news has no kind", () => {
    const meta = render("");

    expect(meta.querySelector(".type")).toBeNull();
    expect(meta.textContent?.trim()).toBe("10 de noviembre de 2022");
  });
});
