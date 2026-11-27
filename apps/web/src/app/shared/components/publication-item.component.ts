import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from "@angular/core";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import { PublicationAuthorsComponent } from "@app/shared/components/publication-authors.component";
import type { ListablePublication, PublicationDisplay } from "@app/shared/publication-display";
import type { PublicOrigin } from "@app/shared/routing/public-origin";
import { SessionService } from "@app/shared/services/session.service";
import type { PublicationAuthor } from "@gmcan/contracts/public";

type ListedPublication = PublicationDisplay<ListablePublication & { authors?: PublicationAuthor[] }>;

/** One publication in a listing: kind, title, venue, DOI, authors, file links and a toggled abstract. */
@Component({
  selector: "app-publication-item",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, PublicationAuthorsComponent],
  template: `
    @let pub = publication();
    <div class="head">
      <span class="publication-kind" [attr.data-kind]="pub.kindCode">{{ pub.kindLabel }}</span>
      <span class="date narrow-only">{{ pub.date }}</span>
    </div>
    <div class="title">{{ pub.title }}</div>
    <div class="meta">
      @for (part of meta(); track $index) {
        <span [class.wide-only]="$first">{{ part }}</span>
      }
    </div>
    @if (pub.doi) {
      <div class="doi">
        DOI: <a [href]="'https://doi.org/' + pub.doi" target="_blank" rel="noopener">{{ pub.doi }}</a>
      </div>
    }
    @if (pub.authors?.length) {
      <app-publication-authors [authors]="pub.authors ?? []" [from]="from()" />
    }
    <div class="actions">
      @if (pub.kindCode !== "conference_paper" && pub.asset) {
        <a class="action" [href]="pub.asset.inline" target="_blank" rel="noopener">{{ text().preview }}</a>
        <a class="action" [href]="pub.asset.download">{{ text().download }}</a>
      }
      @if (pub.abstract) {
        <button
          type="button"
          class="expand-toggle action"
          [attr.aria-expanded]="expanded()"
          [attr.aria-controls]="abstractId()"
          (click)="expanded.set(!expanded())"
        >
          {{ expanded() ? text().seeLess : text().seeMore }}
          <app-icon name="chevron-down" />
        </button>
      }
    </div>
    @if (pub.abstract) {
      <div class="abstract" [id]="abstractId()" [hidden]="!expanded()">
        <div class="abstract-title">{{ text().abstract }}:</div>
        <p>{{ pub.abstract }}</p>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 16px 0 20px;
      border-bottom: 2px solid #d7d7e1;
      font-size: 15px;
      line-height: 1.33;
      letter-spacing: 0.3px;
      color: #000000;
    }

    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 8px;
    }

    .title {
      margin-top: 8px;
      font-weight: bold;
    }

    .date,
    .meta,
    .doi {
      color: var(--muted-text);
    }

    .meta,
    .doi,
    app-publication-authors {
      margin-top: 8px;
    }

    .meta > span:not(:first-child)::before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 4px;
      margin: 0 8px;
      border-radius: 50%;
      vertical-align: middle;
      background-color: #c4c4c4;
    }

    .doi {
      overflow-wrap: anywhere;

      a {
        color: inherit;
        text-decoration: underline;

        &:hover {
          color: #000000;
        }
      }
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 16px;
      margin-top: 16px;

      &:empty {
        display: none;
      }
    }

    .action {
      position: relative;
      padding: 0;
      border: 0;
      background: none;
      font: inherit;
      color: var(--deep-green);
      text-decoration: none;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }

      &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: max(100%, 44px);
        height: max(100%, 44px);
        transform: translate(-50%, -50%);
      }
    }

    .expand-toggle {
      color: #000000;
    }

    .abstract {
      padding-top: 16px;

      p {
        margin: 0;
        font-weight: 300;
      }
    }

    @media (min-width: 961px) {
      .narrow-only {
        display: none;
      }
    }

    @media (max-width: 960px) {
      :host {
        font-size: 13px;
      }

      .publication-kind {
        padding: 2px 4px;
        font-size: 12px;
      }

      .wide-only {
        display: none;
      }

      .meta > .wide-only + span::before {
        display: none;
      }

      .meta:has(> .wide-only:only-child) {
        display: none;
      }

      .abstract {
        padding-top: 8px;
      }
    }
  `,
})
export class PublicationItemComponent {
  private readonly session = inject(SessionService);

  readonly publication = input.required<ListedPublication>();
  readonly from = input.required<PublicOrigin>();

  protected readonly expanded = signal(false);
  protected readonly text = computed(() => this.session.language().publicationsText[0]);
  protected readonly abstractId = computed(() => `publication-abstract-${this.publication().id}`);
  protected readonly meta = computed(() => {
    const pub = this.publication();
    return [pub.date, pub.venue, pub.place].filter((part): part is string => !!part);
  });
}
