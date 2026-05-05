import { Injectable, inject } from "@angular/core";

import { BrowserService } from "./browser.service";

export type SharePlatform = "facebook" | "twitter";

@Injectable({
  providedIn: "root",
})
export class ShareService {
  private readonly browser = inject(BrowserService);

  /**
   * Open a share dialog for the given platform with the provided content.
   *
   * @param platform - Social platform ('facebook' or 'twitter')
   * @param url - URL to share
   * @param title - Optional title for the share (used primarily in Twitter)
   */
  openShare(platform: SharePlatform, url: string, title?: string): void {
    const shareUrl = this.generateShareUrl(platform, url, title);
    this.browser.open(shareUrl, `${platform}-share-dialog`, "width=626,height=436");
  }

  /**
   * Generate the platform-specific share URL.
   *
   * @private
   * @param platform - Social platform
   * @param url - URL to share
   * @param title - Optional title
   * @returns Platform-specific share URL
   */
  private generateShareUrl(platform: SharePlatform, url: string, title?: string): string {
    const encodedUrl = encodeURIComponent(url);

    if (platform === "facebook") {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    }

    const encodedTitle = title ? encodeURIComponent(title) : "";
    return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  }
}
