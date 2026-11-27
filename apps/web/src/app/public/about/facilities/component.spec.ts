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
    items: [...page.querySelectorAll("h3")].map((heading) => heading.textContent?.trim()),
    specs: [...page.querySelectorAll("dl .spec")].map(
      (spec) => `${spec.querySelector("dt")?.textContent?.trim()} ${spec.querySelector("dd")?.textContent?.trim()}`,
    ),
  };
}

describe("FacilitiesComponent", () => {
  it("titles the page and the software section when the group lists software but no equipment", () => {
    const view = render({ software: [{ name: "NEST", description: "Simulator" }] as FacilitiesData["software"] });

    expect(view.h1).toBe(1);
    expect(view.sections).toHaveLength(1);
  });

  it("lists each machine's known specs and leaves out the ones the group did not fill in", () => {
    const view = render({
      equipment: [
        { id: 1, name: "P500", cpu: "Xeon E5-2698", ram: null, gpu: "Quadro K6000", storage: "" },
      ] as FacilitiesData["equipment"],
    });

    expect(view.items).toEqual(["P500"]);
    expect(view.specs).toEqual(["CPU: Xeon E5-2698", "GPU: Quadro K6000"]);
  });

  it("shows no section headings when the group lists nothing", () => {
    expect(render({}).sections).toEqual([]);
  });
});
