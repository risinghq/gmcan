import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import { SessionService } from "@app/shared/services/session.service";

export interface Crumb {
  label: string;
  link?: string;
}

/** The trail from Home to the current page. Home comes first on its own; the last crumb of `trail` is the current page. */
@Component({
  selector: "app-breadcrumb",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <nav [attr.aria-label]="language.breadcrumb">
      <ol>
        @for (crumb of crumbs(); track $index; let last = $last) {
          <li>
            @if (crumb.link && !last) {
              <a [routerLink]="crumb.link">{{ crumb.label }}</a>
            } @else {
              <span [attr.aria-current]="last ? 'page' : null">{{ crumb.label }}</span>
            }
            @if (!last) {
              <app-icon name="caret-right" />
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      padding-bottom: 8px;
    }

    ol {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: 15px;
      line-height: 1.54;
      letter-spacing: 0.3px;
    }

    li {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-right: 4px;
    }

    a {
      font-weight: bold;
      color: #000000;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    span {
      font-weight: 500;
      color: var(--muted-accent);
    }

    app-icon {
      font-size: 16px;
    }

    @media (max-width: 960px) {
      :host {
        padding-bottom: 16px;
      }

      ol {
        font-size: 13px;
      }

      app-icon {
        font-size: 14px;
      }
    }
  `,
})
export class BreadcrumbComponent {
  readonly trail = input.required<readonly Crumb[]>();

  protected readonly language = inject(SessionService).language();

  protected readonly crumbs = computed<readonly Crumb[]>(() => [
    { label: this.language.home, link: "/" },
    ...this.trail(),
  ]);
}
