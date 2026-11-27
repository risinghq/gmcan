import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { inject } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Title } from "@angular/platform-browser";
import { provideRouter, Router, TitleStrategy, withComponentInputBinding } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { AppTitleStrategy } from "@app/shared/routing/app-title.strategy";
import { SessionService } from "@app/shared/services/session.service";
import { beforeEach, describe, expect, it } from "vitest";

import PublicationComponent from "./component";
import type { PublicationViewModel } from "./types";

const publications: PublicationViewModel = { articulos: [], tesis: [], resumenes: [], infoText: "" };

describe("PublicationComponent", () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(
          [
            {
              path: "publications",
              component: PublicationComponent,
              resolve: { publications: () => publications },
              title: () => inject(SessionService).language().publications,
            },
          ],
          withComponentInputBinding(),
        ),
        { provide: TitleStrategy, useClass: AppTitleStrategy },
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  const tabs = () => [...harness.routeNativeElement!.querySelectorAll<HTMLElement>("[role=tab]")];
  const selected = () =>
    tabs()
      .find((tab) => tab.getAttribute("aria-selected") === "true")
      ?.textContent?.trim();

  it("opens the tab the link names", async () => {
    await harness.navigateByUrl("/publications?type=conference_paper");
    expect(selected()).toBe("Resúmenes en eventos");

    await harness.navigateByUrl("/publications?type=unknown");
    expect(selected()).toBe("Artículos");
  });

  it("keeps the open tab in the address and the page title", async () => {
    await harness.navigateByUrl("/publications");
    tabs()[1].click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe("/publications?type=thesis");
    expect(selected()).toBe("Tesis");
    expect(TestBed.inject(Title).getTitle()).toBe("GMCAN | Publicaciones");

    tabs()[0].click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe("/publications");
  });
});
