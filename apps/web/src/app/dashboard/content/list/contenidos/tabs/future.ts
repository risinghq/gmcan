import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RichTextEditorComponent } from "@app/shared/components/rich-text-editor/rich-text-editor.component";

import { ContenidosState } from "../state";

@Component({
  selector: "app-contenidos-future-tab",
  templateUrl: "./future.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ReactiveFormsModule, RichTextEditorComponent],
})
export class ContenidosFutureTab {
  @Input({ required: true }) state!: ContenidosState;
}
