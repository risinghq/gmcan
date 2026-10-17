import { Injectable, inject } from "@angular/core";

import { BrowserService } from "./browser.service";

export type SharePlatform = "facebook" | "twitter";

@Injectable({
  providedIn: "root",
})
export class ShareService {
  private readonly browser = inject(BrowserService);

  openShare(platform: SharePlatform, url: string, title?: string): void {
    const shareUrl = this.generateShareUrl(platform, url, title);
    this.browser.open(shareUrl, `${platform}-share-dialog`, "width=626,height=436");
  }

  private generateShareUrl(platform: SharePlatform, url: string, title?: string): string {
    const encodedUrl = encodeURIComponent(url);

    if (platform === "facebook") {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    }

    const encodedTitle = title ? encodeURIComponent(title) : "";
    return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  }
}
