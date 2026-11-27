import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, provideRouter } from "@angular/router";
import { GroupService } from "@app/shared/services/group.service";
import { NEVER } from "rxjs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { environment } from "../../../environments/environment";
import ChangePassComponent from "./change-pass.component";

const VERIFY = "https://api.example.test/api/email/password-reset/verify";
const CONFIRM = "https://api.example.test/api/email/password-reset/confirm";

describe("ChangePassComponent", () => {
  const original = environment.apiUrl;
  let http: HttpTestingController;
  let fixture: ComponentFixture<ChangePassComponent>;

  const page = () => fixture.nativeElement as HTMLElement;
  const verifying = () => page().querySelector('[role="status"]');
  const heading = () => page().querySelector("h1")?.textContent?.trim();
  const newLinkHref = () => page().querySelector(".login-card a.btn-black")?.getAttribute("href");
  const alert = () => page().querySelector('[role="alert"]');
  const submit = () => page().querySelector<HTMLButtonElement>("button[type=submit]");

  async function verifyAndFill(password: string) {
    await open({ token: "good" });
    http.expectOne(VERIFY).flush({ status: 200 });
    await fixture.whenStable();
    await type("Nueva contraseña", password);
    await type("Repetir contraseña", password);
  }

  async function open(query: Record<string, string>) {
    TestBed.configureTestingModule({
      imports: [ChangePassComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: query, queryParamMap: convertToParamMap(query) } },
        },
        { provide: GroupService, useValue: { getGroup: () => NEVER } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ChangePassComponent);
    await fixture.whenStable();
  }

  async function type(placeholder: string, value: string) {
    const input = page().querySelector<HTMLInputElement>(`input[placeholder="${placeholder}"]`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event("input"));
    input.dispatchEvent(new Event("blur"));
    await fixture.whenStable();
  }

  beforeEach(() => {
    environment.apiUrl = "https://api.example.test";
  });

  afterEach(() => {
    environment.apiUrl = original;
    http.verify();
  });

  it("refuses a link with no token without asking the API and offers a new link", async () => {
    await open({});

    expect(heading()).toBe("El enlace no es válido");
    expect(page().textContent).toContain("incompleto");
    expect(newLinkHref()).toBe("/login?recover=1");
    expect(verifying()).toBeNull();
    expect(page().querySelector("form")).toBeNull();
  });

  it("offers a new link when the API rejects the token", async () => {
    await open({ token: "expired" });
    const verify = http.expectOne(VERIFY);
    expect(verify.request.body).toEqual({ token: "expired" });
    expect(verifying()).not.toBeNull();

    verify.flush({ error: "invalid token" }, { status: 400, statusText: "Bad Request" });
    await fixture.whenStable();

    expect(verifying()).toBeNull();
    expect(heading()).toBe("El enlace no es válido");
    expect(page().textContent).toContain("expiró");
    expect(newLinkHref()).toBe("/login?recover=1");
    expect(page().querySelector("form")).toBeNull();
  });

  it("keeps the form while saving and reports a failed save", async () => {
    await verifyAndFill("new password 1");
    submit()?.click();
    await fixture.whenStable();

    expect(submit()?.disabled).toBe(true);
    http.expectOne(CONFIRM).flush({}, { status: 500, statusText: "Server Error" });
    await fixture.whenStable();

    expect(alert()?.textContent).toContain("No se pudo cambiar la contraseña");
    expect(submit()?.disabled).toBe(false);
  });

  it("sends the new password with the token once both fields match", async () => {
    await open({ token: "good" });
    http.expectOne(VERIFY).flush({ status: 200 });
    await fixture.whenStable();

    await type("Nueva contraseña", "new password 1");
    await type("Repetir contraseña", "new password 2");
    expect(page().textContent).toContain("Las contraseñas no coinciden.");
    expect(submit()?.disabled).toBe(true);

    await type("Repetir contraseña", "new password 1");
    expect(submit()?.disabled).toBe(false);
    submit()?.click();
    await fixture.whenStable();

    const confirm = http.expectOne(CONFIRM);
    expect(confirm.request.body).toEqual({ token: "good", newPassword: "new password 1" });
    confirm.flush({ status: 200 });
    await fixture.whenStable();

    expect(heading()).toBe("¡Contraseña cambiada exitosamente!");
    expect(newLinkHref()).toBe("/login");
    expect(page().querySelector("form")).toBeNull();
  });
});
