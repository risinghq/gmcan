import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";

import { PersonComponent } from "./person.component";

@Component({
  imports: [PersonComponent],
  template: `
    <app-person name="Ana Torres" />
    <app-person name="Justo Rojas Tapia"><button type="button">Justo</button></app-person>
  `,
})
class HostComponent {}

async function render() {
  const fixture = TestBed.createComponent(HostComponent);
  await fixture.whenStable();
  return [...(fixture.nativeElement as HTMLElement).querySelectorAll("app-person")];
}

describe("PersonComponent", () => {
  it("labels the avatar with the person's name", async () => {
    const [plain] = await render();

    expect(plain.querySelector(":scope > span")?.textContent).toBe("Ana Torres");
    expect(plain.querySelector("app-avatar")?.textContent?.trim()).toBe("AT");
  });

  it("uses projected content as the label in place of the name", async () => {
    const [, projected] = await render();

    expect(projected.querySelector(":scope > span button")?.textContent).toBe("Justo");
    expect(projected.querySelector(":scope > span")?.textContent).not.toContain("Justo Rojas Tapia");
  });
});
