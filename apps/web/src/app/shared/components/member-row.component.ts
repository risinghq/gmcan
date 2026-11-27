import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AvatarComponent } from "@app/shared/components/avatar.component";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import type { PublicOrigin } from "@app/shared/routing/public-origin";
import { LookupService } from "@app/shared/services/lookup.service";
import { SessionService } from "@app/shared/services/session.service";
import type { PublicMember } from "@gmcan/contracts/public";

/** One member as a single link to their profile: photo, name and a "see profile" cue. */
@Component({
  selector: "app-member-row",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, IconComponent, RouterLink],
  template: `
    <a [routerLink]="['/detail-member', member().id]" [queryParams]="{ from: from() }">
      <app-avatar [src]="member().photoUrl" [name]="name()" />
      <span class="text">
        <span class="name">{{ name() }}</span>
        <span class="cue" aria-hidden="true">
          {{ language().membersText[0].seeProfile }}
          <app-icon name="chevron-right" />
        </span>
      </span>
    </a>
  `,
  styles: `
    :host {
      display: block;
    }

    a {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 46px;
      color: inherit;
      text-decoration: none;
    }

    app-avatar {
      width: 46px;
      height: 46px;
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .name {
      font-size: 16px;
      font-weight: 600;
      line-height: 1.3;
      letter-spacing: 0.3px;
      color: #000000;
      text-wrap: pretty;
    }

    .cue {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 15px;
      line-height: 1.3;
      letter-spacing: 0.3px;
      color: var(--deep-green);
    }

    app-icon {
      font-size: 16px;
    }

    a:hover .name {
      text-decoration: underline;
    }

    a:hover .cue {
      color: var(--dark-forest-green);
    }

    @media (min-width: 961px) {
      a {
        gap: 16px;
        min-height: 62px;
      }

      app-avatar {
        width: 62px;
        height: 62px;
      }

      .name {
        font-size: 18px;
      }
    }
  `,
})
export class MemberRowComponent {
  private readonly lookup = inject(LookupService);
  protected readonly language = inject(SessionService).language;

  readonly member = input.required<PublicMember>();
  readonly from = input.required<PublicOrigin>();

  protected readonly name = computed(() => this.lookup.memberName(this.member()));
}
