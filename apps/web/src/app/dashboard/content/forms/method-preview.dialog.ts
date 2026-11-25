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
        <div class="methods-img-div">
          @if (data.image; as image) {
            <img class="methods-img" [src]="image" alt="" />
          }
        </div>
        <div class="methods-title">{{ data.name }}</div>
        <div class="methods-sub-divi"></div>
        <div class="methods-text" [innerHTML]="data.description"></div>
      </div>
    </div>
    <div class="outside" [mat-dialog-close]="false">X</div>
  `,
})
export class MethodPreviewDialog {
  readonly data = inject<MethodPreview>(MAT_DIALOG_DATA);
}
