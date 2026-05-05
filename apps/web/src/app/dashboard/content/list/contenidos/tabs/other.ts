import { Component, Input } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AutosizeModule } from "ngx-autosize";

import { ContenidosState } from "../state";

@Component({
  selector: "app-contenidos-other-tab",
  templateUrl: "./other.html",
  imports: [FormsModule, ReactiveFormsModule, AutosizeModule],
})
export class ContenidosOtherTab {
  @Input({ required: true }) state!: ContenidosState;
}
