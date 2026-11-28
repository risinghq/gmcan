import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { AuthzService } from "@app/shared/services/authz.service";
import { DashboardService } from "@app/shared/services/dashboard.service";
import { of } from "rxjs";
import { describe, expect, it } from "vitest";

import DashboardComponent from "./dashboard.component";

describe("DashboardComponent", () => {
  it("lists each member type with its count beside the chart", async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthzService, useValue: { can: () => true } },
        {
          provide: DashboardService,
          useValue: {
            getSummary: () =>
              of({
                membersByType: [
                  { code: "collaborator", label: "Colaboradores", count: 4 },
                  { code: "researcher", label: "Investigadores", count: 7 },
                ],
                publicationsByKind: [],
              }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;

    const rows = [...root.querySelectorAll(".chart-legend li")].map((row) => [
      row.querySelector(".legend-label")?.textContent,
      row.querySelector(".legend-count")?.textContent,
    ]);
    expect(rows).toEqual([
      ["Colaboradores", "4"],
      ["Investigadores", "7"],
    ]);
    expect(root.querySelector(".chart-total")?.textContent).toBe("11");
  });
});
