import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, provideRouter } from "@angular/router";
import { GroupService } from "@app/shared/services/group.service";
import { NEVER } from "rxjs";
import { describe, expect, it } from "vitest";

import LoginComponent from "./login.component";

async function open(query: Record<string, string>): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    imports: [LoginComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } },
      { provide: GroupService, useValue: { getGroup: () => NEVER } },
    ],
  });
  const fixture = TestBed.createComponent(LoginComponent);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe("LoginComponent", () => {
  it("opens on the sign-in form", async () => {
    const page = await open({});

    expect(page.querySelector("input[type=password]")).not.toBeNull();
    expect(page.textContent).not.toContain("Recuperar contraseña");
  });

  it("opens on password recovery when a reset link sends the user back", async () => {
    const page = await open({ recover: "1" });

    expect(page.querySelector("input[type=password]")).toBeNull();
    expect(page.textContent).toContain("Recuperar contraseña");
  });
});
