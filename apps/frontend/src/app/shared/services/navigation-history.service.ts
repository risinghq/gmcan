import { isPlatformBrowser } from "@angular/common";
import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { signal } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class NavigationHistoryService {
  private _router = inject(Router);
  private _platformId = inject(PLATFORM_ID);

  private readonly _previousUrl = signal<string>("");
  readonly previousUrl = this._previousUrl.asReadonly();

  constructor() {
    this._router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      const newUrl = event.urlAfterRedirects;
      const previousUrl = this._previousUrl();

      // Store the current URL as the new previous URL for next navigation
      if (newUrl !== previousUrl) {
        this._previousUrl.set(previousUrl);

        // Persist to sessionStorage for SSR hydration
        if (isPlatformBrowser(this._platformId)) {
          sessionStorage.setItem("previous-page", previousUrl.startsWith("/") ? previousUrl.slice(1) : previousUrl);
        }
      }
    });

    // Restore from sessionStorage on initialization
    if (isPlatformBrowser(this._platformId)) {
      const stored = sessionStorage.getItem("previous-page");
      if (stored) {
        this._previousUrl.set(stored);
      }
    }
  }
}
