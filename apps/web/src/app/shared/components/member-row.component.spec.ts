import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import type { LookupData } from "@app/shared/models/lookup";
import { LookupService } from "@app/shared/services/lookup.service";
import type { PublicMember } from "@gmcan/contracts/public";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { environment } from "../../../environments/environment";
import { MemberRowComponent } from "./member-row.component";

function member(prefixCode: PublicMember["prefixCode"]): PublicMember {
  return {
    id: 4,
    firstName: "Ana",
    lastName: "Torres",
    maternalName: "Ruiz",
    bio: null,
    photoUrl: null,
    photoAlt: "Foto de Ana",
    roleCode: "researcher",
    memberTypeCode: "researcher",
    prefixCode,
  };
}

async function render(prefixCode: PublicMember["prefixCode"]): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(MemberRowComponent);
  fixture.componentRef.setInput("member", member(prefixCode));
  fixture.componentRef.setInput("from", "search");
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe("MemberRowComponent", () => {
  const original = environment.apiUrl;

  beforeEach(async () => {
    environment.apiUrl = "https://api.example.test";
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    const loaded = TestBed.inject(LookupService).load();
    TestBed.inject(HttpTestingController)
      .expectOne("https://api.example.test/api/lookup")
      .flush({
        prefixes: [
          { code: "dra", label: "Dra." },
          { code: "bach", label: "Bach." },
          { code: "none", label: "-" },
        ],
      } as Partial<LookupData>);
    await loaded;
  });

  afterEach(() => {
    environment.apiUrl = original;
  });

  it("is one link to the profile that names the member", async () => {
    const row = await render("dra");
    const links = row.querySelectorAll("a");

    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute("href")).toBe("/detail-member/4?from=search");
    expect(row.querySelector(".name")?.textContent).toBe("Dra. Ana Torres Ruiz");
  });

  it("prints no title for the bachelor and empty prefixes", async () => {
    expect((await render("bach")).querySelector(".name")?.textContent).toBe("Ana Torres Ruiz");
    expect((await render("none")).querySelector(".name")?.textContent).toBe("Ana Torres Ruiz");
    expect((await render(null)).querySelector(".name")?.textContent).toBe("Ana Torres Ruiz");
  });
});
