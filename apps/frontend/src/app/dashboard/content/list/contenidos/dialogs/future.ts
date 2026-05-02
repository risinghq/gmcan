import { DatePipe, TitleCasePipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatDialogClose, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Languages } from "@app/shared/models/languages";
import { GLOBAL } from "@app/shared/services/global";

import type { PreviewFutureData } from "../models";

@Component({
  selector: "app-dialog-future-preview",
  templateUrl: "./future.html",
  styleUrl: "../../../../public/about/works/component.scss",
  imports: [MatDialogClose],
})
export class DialogFuturePreview {
  dialogRef = inject<MatDialogRef<DialogFuturePreview>>(MatDialogRef);
  previewData = inject<PreviewFutureData>(MAT_DIALOG_DATA);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);

  url = GLOBAL.url;
  language = Languages[this.previewData.languageIndex];

  ngOnInit(): void {
    const works = document.getElementById("works");
    if (works) works.innerHTML = this.previewData.group.futureWorkES ?? "";
  }
}
