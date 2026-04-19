import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";

@Injectable({ providedIn: "root" })
export class BrowserService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  readonly isBrowser = isPlatformBrowser(this.platformId);

  innerWidth(fallback = 0): number {
    if (!this.isBrowser) {
      return fallback;
    }
    return globalThis.innerWidth ?? fallback;
  }

  reload(): void {
    if (this.isBrowser) {
      globalThis.location.reload();
    }
  }

  open(url: string, target?: string, features?: string): Window | null {
    if (!this.isBrowser) {
      return null;
    }
    return globalThis.open(url, target, features);
  }

  locationHref(): string {
    if (!this.isBrowser) {
      return "";
    }
    return globalThis.location.href;
  }

  getElementById(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  scrollIntoViewById(id: string): void {
    const element = this.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
}
