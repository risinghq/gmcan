import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { beforeEach, describe, expect, it } from "vitest";

import AboutComponent from "./component";

@Component({ template: "" })
class StubPage {}

describe("AboutComponent", () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          {
            path: "about-us",
            component: AboutComponent,
            children: ["", "about", "lines-investigation", "methods", "facilities-resources", "works"].map((path) => ({
              path,
              component: StubPage,
            })),
          },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  const links = () => [...harness.routeNativeElement!.querySelectorAll<HTMLAnchorElement>("nav.about-categories a")];
  const current = () => links().filter((link) => link.getAttribute("aria-current") === "page");

  it("links every category so crawlers and the keyboard can follow it", async () => {
    await harness.navigateByUrl("/about-us/methods");

    expect(links().map((link) => link.getAttribute("href"))).toEqual([
      "/about-us/about",
      "/about-us/lines-investigation",
      "/about-us/methods",
      "/about-us/facilities-resources",
      "/about-us/works",
    ]);
    expect(current().map((link) => link.getAttribute("href"))).toEqual(["/about-us/methods"]);
  });

  it("names the current category in the breadcrumb when the url carries a query", async () => {
    await harness.navigateByUrl("/about-us/works?from=home");
    const label = current()[0]?.textContent?.trim();

    expect(label).toBeTruthy();
    expect(harness.routeNativeElement!.querySelector("app-breadcrumb")?.textContent).toContain(label);
  });
});
