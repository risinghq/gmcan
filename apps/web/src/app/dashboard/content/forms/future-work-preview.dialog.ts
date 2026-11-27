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
        <div class="page-title">Trabajos Futuros</div>
        <p class="page-subtitle">Perspectivas del Grupo</p>
        <div class="page-rule"></div>
        <div class="page-body" [innerHTML]="data.futureWork"></div>
      </div>
    </div>
    <div class="outside" [mat-dialog-close]="false">X</div>
  `,
})
export class FutureWorkPreviewDialog {
  readonly data = inject<FutureWorkPreview>(MAT_DIALOG_DATA);
}
