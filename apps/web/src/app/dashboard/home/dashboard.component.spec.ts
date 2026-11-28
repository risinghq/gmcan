import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { AuthzService } from "@app/shared/services/authz.service";
import { type DashboardCountItem, DashboardService } from "@app/shared/services/dashboard.service";
import { of } from "rxjs";
import { describe, expect, it } from "vitest";

import DashboardComponent from "./dashboard.component";

async function render(membersByType: DashboardCountItem[], publicationsByKind: DashboardCountItem[]) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthzService, useValue: { can: () => true } },
      { provide: DashboardService, useValue: { getSummary: () => of({ membersByType, publicationsByKind }) } },
    ],
  });
  const fixture = TestBed.createComponent(DashboardComponent);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

function rows(root: HTMLElement, list: string) {
  return [...root.querySelectorAll(`${list} li`)].map((row) => [
    row.querySelector(".legend-label")?.textContent,
    row.querySelector(".legend-count")?.textContent,
  ]);
}

describe("DashboardComponent", () => {
  it("lists each member type with its count beside the chart", async () => {
    const root = await render(
      [
        { code: "collaborator", label: "Colaboradores", count: 4 },
        { code: "researcher", label: "Investigadores", count: 7 },
      ],
      [],
    );

    expect(rows(root, ".chart-legend")).toEqual([
      ["Colaboradores", "4"],
      ["Investigadores", "7"],
    ]);
    expect(root.querySelector(".chart-total")?.textContent).toBe("11");
  });

  it("draws each publication kind as a bar measured against the largest", async () => {
    const root = await render(
      [],
      [
        { code: "journal", label: "Artículo de revista", count: 12 },
        { code: "thesis", label: "Tesis", count: 3 },
      ],
    );

    expect(rows(root, ".bar-list")).toEqual([
      ["Artículo de revista", "12"],
      ["Tesis", "3"],
    ]);
    const widths = [...root.querySelectorAll<HTMLElement>(".bar-list .bar")].map((bar) => bar.style.width);
    expect(widths).toEqual(["100%", "25%"]);
  });
});
