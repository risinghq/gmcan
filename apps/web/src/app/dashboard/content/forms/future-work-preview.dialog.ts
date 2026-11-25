import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";

/** Editor HTML; Angular's sanitizer cleans it on binding, as on the public page. */
export interface FutureWorkPreview {
  futureWork: string;
}

/** Shows the future work section as the public page lays it out, before it is saved. */
@Component({
  selector: "app-future-work-preview-dialog",
  imports: [MatDialogClose],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "../../../public/about/works/component.scss",
  template: `
    <div class="card-works scroll">
      <div class="works-text-div">
        <div class="works-title">Trabajos Futuros</div>
        <div class="works-subtitle">Perspectivas del Grupo</div>
        <div class="works-sub-divi"></div>
        <div [innerHTML]="data.futureWork"></div>
      </div>
    </div>
    <div class="outside" [mat-dialog-close]="false">X</div>
  `,
})
export class FutureWorkPreviewDialog {
  readonly data = inject<FutureWorkPreview>(MAT_DIALOG_DATA);
}
