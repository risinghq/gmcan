import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from "@angular/core";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import { ProjectMembersComponent } from "@app/shared/components/project-members.component";
import type { PublicOrigin } from "@app/shared/routing/public-origin";
import { SessionService } from "@app/shared/services/session.service";
import { dateLabel } from "@app/shared/utils/date";
import { MoneyPipe } from "@app/shared/utils/money";
import type { PublicProject } from "@gmcan/contracts/public";

export type ListedProject = Pick<
  PublicProject,
  | "id"
  | "code"
  | "title"
  | "description"
  | "researchLine"
  | "fundingSource"
  | "fundedAmountMinor"
  | "currencyCode"
  | "startDate"
  | "endDate"
  | "members"
>;

/** One project in a listing: code, title, research line, members and toggled details. */
@Component({
  selector: "app-project-item",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, MoneyPipe, ProjectMembersComponent],
  template: `
    @let item = project();
    <span class="code">{{ item.code }}</span>
    <div class="title">{{ item.title }}</div>
    @if (showLine() && item.researchLine) {
      <div class="line">
        <span class="label">{{ text().linesInvestigation }}:</span>
        {{ item.researchLine }}
      </div>
    }
    @if (item.members.length) {
      <app-project-members [members]="item.members" [from]="from()" />
    }
    <button
      type="button"
      class="expand-toggle"
      [attr.aria-expanded]="expanded()"
      [attr.aria-controls]="detailsId()"
      (click)="expanded.set(!expanded())"
    >
      {{ expanded() ? text().seeLess : text().seeMore }}
      <app-icon name="chevron-down" />
    </button>
    <dl class="details" [id]="detailsId()" [hidden]="!expanded()">
      <div>
        <dt>{{ text().description }}:</dt>
        <dd>{{ item.description }}</dd>
      </div>
      <div>
        <dt>{{ text().source }}:</dt>
        <dd>{{ item.fundingSource }}</dd>
      </div>
      <div>
        <dt>{{ text().amount }}:</dt>
        <dd>{{ item.fundedAmountMinor | money: item.currencyCode : locale() }}</dd>
      </div>
      <div>
        <dt>{{ text().dateStart }}:</dt>
        <dd>{{ dates().start }}</dd>
      </div>
      @if (dates().end) {
        <div>
          <dt>{{ text().dateEnd }}:</dt>
          <dd>{{ dates().end }}</dd>
        </div>
      }
    </dl>
  `,
  styles: `
    :host {
      display: block;
      padding: 20px 0;
      border-bottom: 1px solid #d7d7e1;
      font-size: 15px;
      line-height: 1.5;
      letter-spacing: 0.3px;
      color: #000000;
    }

    .code {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 13px;
      font-variant-numeric: tabular-nums;
      line-height: 1.2;
      color: var(--muted-text);
      background-color: #e8e8e8;
    }

    .title {
      margin-top: 8px;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.4;
      letter-spacing: 0.2px;
    }

    .line {
      margin-top: 4px;
      color: var(--muted-text);
    }

    .label,
    dt {
      font-weight: 500;
    }

    app-project-members {
      margin-top: 16px;
    }

    .expand-toggle {
      margin-top: 16px;
      color: #000000;
    }

    .details {
      margin: 0;
      padding-top: 16px;

      div + div {
        margin-top: 8px;
      }

      dt,
      dd {
        display: inline;
        margin: 0;
      }

      dt {
        margin-inline-end: 0.3em;
      }

      dd {
        font-weight: 300;
      }
    }

    @media (min-width: 961px) {
      .title {
        font-size: 18px;
      }
    }

    @media (max-width: 960px) {
      .details {
        padding-top: 8px;
      }
    }
  `,
})
export class ProjectItemComponent {
  private readonly session = inject(SessionService);

  readonly project = input.required<ListedProject>();
  readonly from = input.required<PublicOrigin>();
  /** Off inside a research line's own listing, where the line is the heading above. */
  readonly showLine = input(true);

  protected readonly expanded = signal(false);
  protected readonly text = computed(() => this.session.language().projectsText[0]);
  protected readonly locale = computed(() => this.session.language().locale);
  protected readonly detailsId = computed(() => `project-details-${this.project().id}`);
  protected readonly dates = computed(() => {
    const { startDate, endDate } = this.project();
    return {
      start: dateLabel(startDate, "MMMM y", this.locale()),
      end: dateLabel(endDate, "MMMM y", this.locale()),
    };
  });
}
