import { isPlatformBrowser } from "@angular/common";
import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { signal } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class NavigationHistoryService {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly previousUrlState = signal<string>("");
  readonly previousUrl = this.previousUrlState.asReadonly();

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      const newUrl = event.urlAfterRedirects;
      const previousUrl = this.previousUrlState();

      if (newUrl !== previousUrl) {
        this.previousUrlState.set(previousUrl);
        this.persistPreviousUrl(previousUrl);
      }
    });

    this.restorePreviousUrl();
  }

  private persistPreviousUrl(previousUrl: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    sessionStorage.setItem("previous-page", previousUrl.startsWith("/") ? previousUrl.slice(1) : previousUrl);
  }

  private restorePreviousUrl(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const stored = sessionStorage.getItem("previous-page");
    if (stored) {
      this.previousUrlState.set(stored);
    }
  }
}
