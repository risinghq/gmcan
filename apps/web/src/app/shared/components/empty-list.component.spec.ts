import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";

import { EmptyListComponent } from "./empty-list.component";

@Component({
  imports: [EmptyListComponent],
  template: `<app-empty-list [searching]="searching()">Todavía no tienes artículos.</app-empty-list>`,
})
class HostComponent {
  readonly searching = signal(false);
}

describe("EmptyListComponent", () => {
  it("says the list is empty until a search matches nothing, and announces the change", async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const status: HTMLElement = fixture.nativeElement.querySelector("app-empty-list");

    expect(status.getAttribute("role")).toBe("status");
    expect(status.textContent?.trim()).toBe("Todavía no tienes artículos.");

    fixture.componentInstance.searching.set(true);
    await fixture.whenStable();
    expect(status.textContent?.trim()).toBe("Ningún resultado coincide con la búsqueda.");
  });
});
