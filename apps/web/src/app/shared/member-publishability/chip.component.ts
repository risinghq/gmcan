import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { MatDialog } from "@angular/material/dialog";

import { MemberService } from "../services/member.service";
import { PublishabilityDialogComponent } from "./dialog.component";
import { countMissingRequirements, publishabilityTooltip } from "./utils";

@Component({
  selector: "app-publishability-chip",
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .status-chip {
      border: 0;
      border-radius: 999px;
      cursor: pointer;
      display: inline-block;
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      line-height: 1;
      padding: 6px 10px;
    }

    .status-ready {
      background-color: #dff6e7;
      color: #0e6b32;
    }

    .status-draft {
      background-color: #fff0d3;
      color: #8c5000;
    }
  `,
  template: `
    @if (status.value(); as state) {
      <button
        type="button"
        class="status-chip"
        [class.status-ready]="state.publishable"
        [class.status-draft]="!state.publishable"
        [title]="tooltip()"
        (click)="details()"
      >
        {{ state.publishable ? "Público" : "Borrador · " + missing() }}
      </button>
    }
  `,
})
export class PublishabilityChipComponent {
  readonly memberId = input.required<number>();
  readonly memberName = input.required<string>();
  /** The signed-in member reads their own state, since only an administrator reads another member's. */
  readonly own = input(false);

  private readonly members = inject(MemberService);
  private readonly dialog = inject(MatDialog);

  readonly status = rxResource({
    params: () => ({ id: this.memberId(), own: this.own() }),
    stream: ({ params }) =>
      params.own ? this.members.getOwnPublishability() : this.members.getMemberPublishability(params.id),
  });

  readonly tooltip = computed(() => publishabilityTooltip(this.status.value() ?? null));
  readonly missing = computed(() => {
    const state = this.status.value();
    return state ? countMissingRequirements(state) : 0;
  });

  refresh(): void {
    this.status.reload();
  }

  details(): void {
    const publishability = this.status.value();
    if (!publishability) return;
    this.dialog.open(PublishabilityDialogComponent, {
      width: "560px",
      data: { memberName: this.memberName(), publishability },
    });
  }
}
