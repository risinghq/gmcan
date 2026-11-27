import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ApplicationRef } from "@angular/core";
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

async function submitEmpty(page: HTMLElement): Promise<void> {
  document.body.appendChild(page);
  page.querySelector<HTMLButtonElement>("button[type=submit]")?.click();
  await TestBed.inject(ApplicationRef).whenStable();
}

function errorFor(page: HTMLElement, name: string): string | null {
  const id = page.querySelector(`input[name="${name}"]`)?.getAttribute("aria-describedby");
  return id ? (page.querySelector(`#${id}`)?.textContent?.trim() ?? null) : null;
}

describe("LoginComponent", () => {
  it("opens on the sign-in form", async () => {
    const page = await open({});

    expect(page.querySelector("input[type=password]")).not.toBeNull();
    expect(page.querySelector("h1")?.textContent?.trim()).toBe("Iniciar Sesión");
    expect(page.querySelector("a.back-div")?.getAttribute("href")).toBe("/");
    expect(page.textContent).not.toContain("Recuperar contraseña");
  });

  it("opens on password recovery when a reset link sends the user back", async () => {
    const page = await open({ recover: "1" });

    expect(page.querySelector("input[type=password]")).toBeNull();
    expect(page.querySelector("h1")?.textContent?.trim()).toBe("Recuperar contraseña");
  });

  it("names the missing sign-in fields instead of disabling the button", async () => {
    const page = await open({});
    expect(page.querySelector<HTMLButtonElement>("button[type=submit]")?.disabled).toBe(false);

    await submitEmpty(page);

    TestBed.inject(HttpTestingController).expectNone(() => true);
    expect(errorFor(page, "email")).toBe("Ingresa tu correo electrónico.");
    expect(errorFor(page, "password")).toBe("Ingresa tu contraseña.");
    expect(document.activeElement?.getAttribute("name")).toBe("email");
    page.remove();
  });

  it("names the missing recovery email", async () => {
    const page = await open({ recover: "1" });

    await submitEmpty(page);

    TestBed.inject(HttpTestingController).expectNone(() => true);
    expect(errorFor(page, "email")).toBe("Ingresa tu correo electrónico.");
    expect(document.activeElement?.getAttribute("name")).toBe("email");
    page.remove();
  });
});
