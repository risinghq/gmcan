import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";

export interface FutureWorkPreview {
  futureWork: string;
}

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
        <div class="works-text" [innerHTML]="data.futureWork"></div>
      </div>
    </div>
    <div class="outside" [mat-dialog-close]="false">X</div>
  `,
})
export class FutureWorkPreviewDialog {
  readonly data = inject<FutureWorkPreview>(MAT_DIALOG_DATA);
}
