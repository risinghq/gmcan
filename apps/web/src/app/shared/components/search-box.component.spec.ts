import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";

import { SearchBoxComponent } from "./search-box.component";

async function render(query = "") {
  const fixture = TestBed.createComponent(SearchBoxComponent);
  fixture.componentRef.setInput("placeholder", "Buscar proyectos");
  fixture.componentRef.setInput("action", "Buscar");
  fixture.componentRef.setInput("query", query);
  const searches: string[] = [];
  fixture.componentInstance.search.subscribe((term) => searches.push(term));
  await fixture.whenStable();
  const element = fixture.nativeElement as HTMLElement;
  return { fixture, searches, input: element.querySelector("input")!, form: element.querySelector("form")! };
}

describe("SearchBoxComponent", () => {
  it("names the field by its placeholder", async () => {
    const { input } = await render();

    expect(input.getAttribute("aria-label")).toBe("Buscar proyectos");
  });

  it("emits the typed query when the form is submitted", async () => {
    const { fixture, searches, input, form } = await render();

    input.value = "carbono";
    input.dispatchEvent(new Event("input"));
    form.requestSubmit();

    expect(searches).toEqual(["carbono"]);
    expect(fixture.componentInstance.query()).toBe("carbono");
  });

  it("shows a query set by the page", async () => {
    const { input } = await render("grafeno");

    expect(input.value).toBe("grafeno");
  });
});
