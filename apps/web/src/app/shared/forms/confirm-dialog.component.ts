import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";
import { firstValueFrom } from "rxjs";

export interface ConfirmDialogData {
  title: string;
  text: string;
  confirm: string;
  dismiss: string;
}

@Component({
  selector: "app-confirm-dialog",
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="title-div" mat-dialog-title>
      <span class="title-mat">{{ data.title }}</span>
    </div>
    <mat-dialog-content class="mat-text-dialog">{{ data.text }}</mat-dialog-content>
    <mat-dialog-actions class="mat-dialog-justify" align="end">
      <div class="cancel-button link link-set" [mat-dialog-close]="true">{{ data.confirm }}</div>
      <div class="black-btn" [mat-dialog-close]="false" cdkFocusInitial>
        <div class="link link-set">{{ data.dismiss }}</div>
      </div>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}

/** Resolves true only when the admin picks the confirm action; closing the dialog any other way is a no. */
export async function confirmAction(dialog: MatDialog, data: ConfirmDialogData): Promise<boolean> {
  const ref = dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
    width: "530px",
    panelClass: "confirm-dialog",
    data,
  });
  return (await firstValueFrom(ref.afterClosed())) === true;
}
