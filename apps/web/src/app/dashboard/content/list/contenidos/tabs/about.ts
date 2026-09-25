import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";

import { ContenidosState } from "../state";

@Component({
  selector: "app-contenidos-about-tab",
  templateUrl: "./about.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ReactiveFormsModule, CKEditorModule],
})
export class ContenidosAboutTab {
  @Input({ required: true }) state!: ContenidosState;
}
