import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

import { ShareService } from "../services/share.service";

/**
 * Reusable social share buttons component.
 * Displays Facebook and Twitter share buttons with hover effects.
 * Encapsulates share logic and styling for consistency across the app.
 */
@Component({
  selector: "app-shared-share-buttons",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="share-row">
      <button
        type="button"
        class="share-button"
        (mouseenter)="hoveredShare = 'facebook'"
        (mouseleave)="hoveredShare = null"
        (click)="onShare('facebook')"
        aria-label="Share on Facebook"
      >
        <img class="share-icon" [src]="getShareIconPath('facebook')" alt="Facebook" />
      </button>
      <button
        type="button"
        class="share-button"
        (mouseenter)="hoveredShare = 'twitter'"
        (mouseleave)="hoveredShare = null"
        (click)="onShare('twitter')"
        aria-label="Share on Twitter"
      >
        <img class="share-icon" [src]="getShareIconPath('twitter')" alt="Twitter" />
      </button>
    </div>
  `,
  styles: `
    .share-row {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .share-button {
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    .share-icon {
      width: 24px;
      height: 24px;
    }
  `,
})
export class SharedShareButtonsComponent {
  @Input() url: string = "";
  @Input() title?: string;

  hoveredShare: "facebook" | "twitter" | null = null;

  constructor(private shareService: ShareService) {}

  onShare(platform: "facebook" | "twitter"): void {
    this.shareService.openShare(platform, this.url, this.title);
  }

  getShareIconPath(platform: "facebook" | "twitter"): string {
    const isActive = this.hoveredShare === platform;
    const iconName = platform === "facebook" ? "Facebook" : "twitter";
    const suffix = isActive ? "2" : "";
    return `../../assets/img/${iconName}${suffix}.svg`;
  }
}
