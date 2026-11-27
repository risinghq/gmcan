import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { RESPONSE_INIT } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Title } from "@angular/platform-browser";
import { provideRouter, TitleStrategy } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { routes } from "@app/app.routes";
import { AppTitleStrategy } from "@app/shared/routing/app-title.strategy";
import { describe, expect, it } from "vitest";

describe("AppErrorComponent", () => {
  it("answers 500 with a titled page that links home and hides the internal code", async () => {
    const response: ResponseInit = {};
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(routes),
        { provide: TitleStrategy, useClass: AppTitleStrategy },
        { provide: RESPONSE_INIT, useValue: response },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl("/error?code=internal_error");
    const page = harness.routeNativeElement as HTMLElement;

    expect(response.status).toBe(500);
    expect(TestBed.inject(Title).getTitle()).toBe("GMCAN | Algo salió mal");
    expect(page.querySelector("h1")?.textContent).toBe("Algo salió mal");
    expect(page.querySelector(".not-btn")?.getAttribute("href")).toBe("/");
    expect(page.textContent).not.toContain("internal_error");
  });
});
