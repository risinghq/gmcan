import { DatePipe, TitleCasePipe } from "@angular/common";
import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { MatDialogClose, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GLOBAL } from "@app/shared/services/global";

import type { PreviewAboutData } from "../models";

@Component({
  selector: "app-dialog-about-preview",
  templateUrl: "./about.html",
  styleUrl: "../../../../../public/about/about-us/component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogClose],
})
export class DialogAboutPreview {
  dialogRef = inject<MatDialogRef<DialogAboutPreview>>(MatDialogRef);
  previewData = inject<PreviewAboutData>(MAT_DIALOG_DATA);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  labels = {
    aboutUs: "¿Quiénes Somos?",
    ourObjectives: "Nuestros Objetivos",
    ourObjectivesQuestion: "¿Qué objetivos tenemos?",
    ourServices: "Nuestros Servicios",
    ourServicesQuestion: "¿Qué servicios ofrecemos?",
  };

  url = GLOBAL.url;
}
