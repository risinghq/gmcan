import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { RouterLink } from "@angular/router";
import { SessionService } from "@app/shared/services/session.service";
import { UiStateService } from "@app/shared/services/ui-state.service";

@Component({
  selector: "app-sent-dialog",
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .sent-logo {
      display: block;
      height: 32px;
      margin: 24px 24px 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e8e8e8;
      box-sizing: content-box;
    }

    .sent-thanks {
      margin: 0;
      font-weight: 600;
      color: var(--deep-green);
    }

    p {
      margin: 0 0 8px;
    }

    .btn-black {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      padding: 0 16px;
      box-sizing: border-box;
    }
  `,
  template: `
    <img class="sent-logo" [src]="groupInfo().assets.header" alt="GMCAN" />
    <h2 class="title-mat" mat-dialog-title>{{ text.succesful }}</h2>
    <mat-dialog-content class="mat-text-dialog">
      <p>{{ text.succesfulText }} {{ text.succesfulText1 }}</p>
      <p class="sent-thanks">{{ text.thanks }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <a class="btn-black" routerLink="/" mat-dialog-close>
        <span class="link link-set">{{ text.back }}</span>
      </a>
    </mat-dialog-actions>
  `,
})
export class SentDialogComponent {
  readonly groupInfo = inject(UiStateService).groupInfo;
  readonly text = inject(SessionService).language().joinUsModal[0];
}
