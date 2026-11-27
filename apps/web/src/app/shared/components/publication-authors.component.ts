import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AvatarComponent } from "@app/shared/components/avatar.component";
import type { PublicOrigin } from "@app/shared/routing/public-origin";
import type { PublicationAuthor } from "@gmcan/contracts/public";

/** A publication's authors in order. Registered members link to their profile with `from` as the page to return to. */
@Component({
  selector: "app-publication-authors",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, RouterLink],
  template: `
    <ul>
      @for (author of authors(); track author.authorOrder) {
        <li>
          @if (author.kind === "registered") {
            <app-avatar [src]="author.photoUrl" [alt]="author.photoAlt" [name]="author.name" />
            <a [routerLink]="['/detail-member', author.memberId]" [queryParams]="{ from: from() }">{{ author.name }}</a>
          } @else {
            <app-avatar [name]="author.name" />
            <span>{{ author.name }}</span>
          }
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: block;
      font-family: "IBM Plex Sans", serif;
      font-size: 15px;
      font-weight: 300;
      line-height: 1.33;
      letter-spacing: 0.3px;
      color: #000000;
    }

    ul {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 16px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    app-avatar {
      width: 20px;
      height: 20px;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    @media (max-width: 960px) {
      :host {
        font-size: 13px;
      }
    }
  `,
})
export class PublicationAuthorsComponent {
  readonly authors = input.required<readonly PublicationAuthor[]>();
  readonly from = input.required<PublicOrigin>();
}
