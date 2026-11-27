import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";

import { ImageFieldComponent } from "./image-field.component";

@Component({
  imports: [ImageFieldComponent],
  template: `
    <app-image-field id="cover" label="Imagen de portada" required />
    <app-image-field id="logo" label="Logo del grupo" />
  `,
})
class HostComponent {}

describe("ImageFieldComponent", () => {
  it("names the file input by its label and marks a required field", async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const cover = root.querySelector<HTMLElement>("#cover")!;
    const logo = root.querySelector<HTMLElement>("#logo")!;

    expect(cover.querySelector("input")?.getAttribute("aria-label")).toBe("Imagen de portada");
    expect(cover.querySelector("input")?.getAttribute("aria-required")).toBe("true");
    expect(cover.querySelector(".text-category .red-text")?.textContent).toBe("*");

    expect(logo.querySelector("input")?.getAttribute("aria-required")).toBeNull();
    expect(logo.querySelector(".red-text")).toBeNull();
  });
});
