import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Title } from "@angular/platform-browser";
import { provideRouter, type Routes, TitleStrategy } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { routes } from "@app/app.routes";
import { AppTitleStrategy } from "@app/shared/routing/app-title.strategy";
import { describe, expect, it } from "vitest";

import NotFoundComponent from "./not-found.component";

async function open(url: string, config: Routes): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter(config),
      { provide: TitleStrategy, useClass: AppTitleStrategy },
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  return harness.routeNativeElement as HTMLElement;
}

describe("NotFoundComponent", () => {
  it("names the missing page in the tab title and links home", async () => {
    const page = await open("/no-such-page", routes);

    expect(TestBed.inject(Title).getTitle()).toBe("GMCAN | Página no encontrada");
    expect(page.querySelector("a")?.getAttribute("href")).toBe("/");
  });

  it("sends a dashboard user back to the dashboard", async () => {
    const page = await open("/dashboard/no-such-page", [{ path: "**", component: NotFoundComponent }]);

    expect(page.querySelector("a")?.getAttribute("href")).toBe("/dashboard");
    expect(page.querySelector("a")?.textContent?.trim()).toBe("Volver al dashboard");
  });
});
