import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";

import { ContenidosState } from "../state";

@Component({
  selector: "app-contenidos-future-tab",
  templateUrl: "./future.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ReactiveFormsModule, CKEditorModule],
})
export class ContenidosFutureTab {
  @Input({ required: true }) state!: ContenidosState;
}
