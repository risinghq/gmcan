import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RichTextEditorComponent } from "@app/shared/components/rich-text-editor/rich-text-editor.component";

import { ContenidosState } from "../state";

@Component({
  selector: "app-contenidos-about-tab",
  templateUrl: "./about.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ReactiveFormsModule, RichTextEditorComponent],
})
export class ContenidosAboutTab {
  @Input({ required: true }) state!: ContenidosState;
}
