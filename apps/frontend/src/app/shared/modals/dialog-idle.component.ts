import { CdkScrollable } from "@angular/cdk/scrolling";
import { NgIf } from "@angular/common";
import { Component, Inject } from "@angular/core";
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
  imports: [MatDialogTitle, NgIf, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogIdle {
  constructor(
    public dialogRef: MatDialogRef<DialogIdle>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
