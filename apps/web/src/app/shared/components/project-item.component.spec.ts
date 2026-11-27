import { TestBed, type ComponentFixture } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, expect, it } from "vitest";

import { type ListedProject, ProjectItemComponent } from "./project-item.component";

function project(overrides: Partial<ListedProject> = {}): ListedProject {
  return {
    id: 7,
    code: "PR-07",
    title: "Captura de carbono",
    description: "Mide el carbono del suelo.",
    researchLine: "Suelos",
    fundingSource: "Concytec",
    fundedAmountMinor: 1500000,
    currencyCode: "pen",
    startDate: "2024-03-15",
    endDate: null,
    members: [{ memberId: 2, name: "Ana Torres", photoUrl: null, photoAlt: "Foto de Ana" }],
    ...overrides,
  };
}

async function render(item: ListedProject, showLine = true): Promise<ComponentFixture<ProjectItemComponent>> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(ProjectItemComponent);
  fixture.componentRef.setInput("project", item);
  fixture.componentRef.setInput("from", "projects");
  fixture.componentRef.setInput("showLine", showLine);
  await fixture.whenStable();
  return fixture;
}

function host(fixture: ComponentFixture<ProjectItemComponent>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

describe("ProjectItemComponent", () => {
  it("reveals the details when the toggle is pressed", async () => {
    const fixture = await render(project());
    const toggle = host(fixture).querySelector<HTMLButtonElement>(".expand-toggle")!;
    const details = host(fixture).querySelector<HTMLElement>(".details")!;

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(details.hidden).toBe(true);
    expect(toggle.getAttribute("aria-controls")).toBe(details.id);

    toggle.click();
    await fixture.whenStable();

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(details.hidden).toBe(false);
    expect(details.textContent).toContain("Concytec");
  });

  it("shows the research line only when it exists and is wanted", async () => {
    expect(host(await render(project())).querySelector(".line")?.textContent).toContain("Suelos");
    expect(host(await render(project({ researchLine: null }))).querySelector(".line")).toBeNull();
    expect(host(await render(project(), false)).querySelector(".line")).toBeNull();
  });

  it("writes the start and end months without a comma", async () => {
    const fixture = await render(project({ endDate: "2025-11-20" }));
    const text = host(fixture).querySelector(".details")!.textContent!.replace(/\s+/g, " ");

    expect(text).toContain("Marzo 2024");
    expect(text).toContain("Noviembre 2025");
  });
});
