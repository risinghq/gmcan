import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AvatarComponent } from "@app/shared/components/avatar.component";
import type { PublicOrigin } from "@app/shared/routing/public-origin";
import { SessionService } from "@app/shared/services/session.service";
import type { PublicProjectMember } from "@gmcan/contracts/public";

/** A project's responsible members, each linked to their profile with `from` as the page to return to. */
@Component({
  selector: "app-project-members",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, RouterLink],
  template: `
    <span class="label">{{ language.projectsText[0].responsable }}:</span>
    <ul>
      @for (member of members(); track member.memberId) {
        <li>
          <app-avatar [src]="member.photoUrl" [alt]="member.photoAlt" [name]="member.name" />
          <a [routerLink]="['/detail-member', member.memberId]" [queryParams]="{ from: from() }">{{ member.name }}</a>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: max-content 1fr;
      column-gap: 8px;
      font-size: 15px;
      line-height: 24px;
      letter-spacing: 0.3px;
      color: #000000;
    }

    .label {
      font-weight: 500;
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
      font-weight: 300;
      color: inherit;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  `,
})
export class ProjectMembersComponent {
  readonly members = input.required<PublicProjectMember[]>();
  readonly from = input.required<PublicOrigin>();

  protected readonly language = inject(SessionService).language();
}
