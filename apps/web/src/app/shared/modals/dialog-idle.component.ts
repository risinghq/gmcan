import { CdkScrollable } from "@angular/cdk/scrolling";
import { Component, inject } from "@angular/core";
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { DialogData } from "@app/shared/models/dialogdata";

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "./dialog-options.html",
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogIdle {
  dialogRef = inject<MatDialogRef<DialogIdle>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
