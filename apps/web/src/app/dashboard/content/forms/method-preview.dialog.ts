import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";

export interface MethodPreview {
  name: string;
  description: string;
  image: string | null;
}

@Component({
  selector: "app-method-preview-dialog",
  imports: [MatDialogClose],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "../../../public/about/method/component.scss",
  template: `
    <div class="card-methods">
      <div class="methods-text-div">
        @if (data.image; as image) {
          <img class="methods-img" [src]="image" alt="" />
        }
        <div class="page-title">{{ data.name }}</div>
        <div class="page-rule"></div>
        <div class="page-body" [innerHTML]="data.description"></div>
      </div>
    </div>
    <div class="outside" [mat-dialog-close]="false">X</div>
  `,
})
export class MethodPreviewDialog {
  readonly data = inject<MethodPreview>(MAT_DIALOG_DATA);
}
