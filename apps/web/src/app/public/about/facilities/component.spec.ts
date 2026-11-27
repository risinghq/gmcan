import { TestBed } from "@angular/core/testing";
import type { FacilitiesData } from "@app/public/about/data";
import { describe, expect, it } from "vitest";

import FacilitiesComponent from "./component";

function render(data: Partial<FacilitiesData>) {
  const fixture = TestBed.createComponent(FacilitiesComponent);
  fixture.componentRef.setInput("facilities", {
    group: { assets: { facilities: "/img/lab.avif" }, facilities: "Lab" },
    equipment: [],
    software: [],
    ...data,
  } as FacilitiesData);
  fixture.detectChanges();
  const page = fixture.nativeElement as HTMLElement;
  return {
    h1: page.querySelectorAll("h1").length,
    sections: [...page.querySelectorAll("h2")].map((heading) => heading.textContent?.trim()),
  };
}

describe("FacilitiesComponent", () => {
  it("titles the page and the software section when the group lists software but no equipment", () => {
    const view = render({ software: [{ name: "NEST", description: "Simulator" }] as FacilitiesData["software"] });

    expect(view.h1).toBe(1);
    expect(view.sections).toHaveLength(1);
  });

  it("shows no section headings when the group lists nothing", () => {
    expect(render({}).sections).toEqual([]);
  });
});
