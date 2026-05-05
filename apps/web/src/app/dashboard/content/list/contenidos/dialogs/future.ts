import { DatePipe, TitleCasePipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatDialogClose, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GLOBAL } from "@app/shared/services/global";

import type { PreviewFutureData } from "../models";

@Component({
  selector: "app-dialog-future-preview",
  templateUrl: "./future.html",
  styleUrl: "../../../../../public/about/works/component.scss",
  imports: [MatDialogClose],
})
export class DialogFuturePreview {
  dialogRef = inject<MatDialogRef<DialogFuturePreview>>(MatDialogRef);
  previewData = inject<PreviewFutureData>(MAT_DIALOG_DATA);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  labels = {
    title: "Trabajos Futuros",
    subtitle: "Perspectivas del Grupo",
  };

  url = GLOBAL.url;
  ngOnInit(): void {
    const works = document.getElementById("works");
    if (works) works.innerHTML = this.previewData.group.futureWork ?? "";
  }
}
