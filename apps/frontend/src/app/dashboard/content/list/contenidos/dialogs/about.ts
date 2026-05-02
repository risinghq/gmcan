import { DatePipe, TitleCasePipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatDialogClose, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Languages } from "@app/shared/models/languages";
import { GLOBAL } from "@app/shared/services/global";

import type { PreviewAboutData } from "../models";

@Component({
  selector: "app-dialog-about-preview",
  templateUrl: "./about.html",
  styleUrl: "../../../../public/about/about-us/component.scss",
  imports: [MatDialogClose],
})
export class DialogAboutPreview {
  dialogRef = inject<MatDialogRef<DialogAboutPreview>>(MatDialogRef);
  previewData = inject<PreviewAboutData>(MAT_DIALOG_DATA);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);

  url = GLOBAL.url;
  language = Languages[this.previewData.languageIndex];

  ngOnInit(): void {
    const services = document.getElementById("services");
    const whoAre = document.getElementById("whoAre");
    const objectives = document.getElementById("objectives");
    if (services) services.innerHTML = this.previewData.about.servicesES ?? "";
    if (whoAre) whoAre.innerHTML = this.previewData.about.descriptionES ?? "";
    if (objectives) objectives.innerHTML = this.previewData.about.objectivesES ?? "";
  }
}
