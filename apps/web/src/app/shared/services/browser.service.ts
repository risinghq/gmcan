import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";

@Injectable({ providedIn: "root" })
export class BrowserService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  readonly isBrowser = isPlatformBrowser(this.platformId);

  reload(): void {
    if (this.isBrowser) {
      globalThis.location.reload();
    }
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
