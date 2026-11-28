import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormArray, type FormControl } from "@angular/forms";
import { describe, expect, it } from "vitest";

import { requiredText } from "./text-fields";
import { TextListComponent } from "./text-list.component";

@Component({
  imports: [TextListComponent],
  template: `<app-text-list label="Objetivos" [list]="list" />`,
})
class TextListHostComponent {
  readonly list = new FormArray<FormControl<string>>([requiredText(), requiredText()]);
}

function render() {
  const fixture = TestBed.createComponent(TextListHostComponent);
  fixture.componentInstance.list.setValue(["Investigar", "Publicar"]);
  fixture.detectChanges();
  const host = fixture.nativeElement as HTMLElement;
  return { fixture, host };
}

describe("TextListComponent", () => {
  it("names every entry and its remove button by the list label and position", () => {
    const { host } = render();

    const entries = [...host.querySelectorAll("textarea")].map((entry) => entry.getAttribute("aria-label"));
    const removes = [...host.querySelectorAll("button")]
      .filter((button) => button.textContent?.trim() === "Quitar")
      .map((button) => button.getAttribute("aria-label"));

    expect(entries).toEqual(["Objetivos 1", "Objetivos 2"]);
    expect(removes).toEqual(["Quitar objetivos 1", "Quitar objetivos 2"]);
  });

  it("removes the entry whose button was pressed", () => {
    const { fixture, host } = render();

    host.querySelector<HTMLButtonElement>('[aria-label="Quitar objetivos 1"]')?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.list.value).toEqual(["Publicar"]);
    expect(fixture.componentInstance.list.dirty).toBe(true);
  });
});
