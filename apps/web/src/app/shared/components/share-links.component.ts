import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import type { IconName } from "@app/shared/components/icon/icons";
import { SessionService } from "@app/shared/services/session.service";

interface ShareLink {
  name: string;
  icon: IconName;
  href: string;
}

export function shareLinks(url: string, title: string): ShareLink[] {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  return [
    { name: "Facebook", icon: "brand-facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "X", icon: "brand-x", href: `https://x.com/intent/post?url=${u}&text=${t}` },
    { name: "LinkedIn", icon: "brand-linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: "WhatsApp", icon: "brand-whatsapp", href: `https://wa.me/?text=${t}%20${u}` },
  ];
}

@Component({
  selector: "app-share-links",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <ul class="share-links" [attr.aria-label]="language().shareOn">
      @for (link of links(); track link.name) {
        <li>
          <a
            class="share-link"
            [href]="link.href"
            target="_blank"
            rel="noopener noreferrer"
            [attr.aria-label]="language().shareOn + ' ' + link.name"
          >
            <app-icon [name]="link.icon" />
          </a>
        </li>
      }
    </ul>
  `,
  styles: `
    .share-links {
      display: flex;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .share-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border: 1px solid #d5d8d8;
      border-radius: 4px;
      color: #30393a;
      transition:
        color 150ms ease-out,
        border-color 150ms ease-out;

      &:hover,
      &:focus-visible {
        color: #006400;
        border-color: #006400;
      }
    }

    app-icon {
      font-size: 20px;
    }
  `,
})
export class ShareLinksComponent {
  readonly url = input.required<string>();
  readonly title = input.required<string>();

  protected readonly language = inject(SessionService).language;
  protected readonly links = computed(() => shareLinks(this.url(), this.title()));
}
