import { CdkScrollable } from "@angular/cdk/scrolling";
import { Component } from "@angular/core";
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";

@Component({
  selector: "app-confirm-leave",
  standalone: true,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
  template: `
    <div class="title-div" mat-dialog-title>
      <span class="title-mat">¿Estás seguro que deseas volver sin guardar?</span>
    </div>
    <mat-dialog-content class="mat-text-dialog">La información no se guardará</mat-dialog-content>
    <mat-dialog-actions class="mat-dialog-justify" align="end">
      <div class="cancel-button link link-set" [mat-dialog-close]="true">Sí, volver</div>
      <div class="black-btn" [mat-dialog-close]="false" cdkFocusInitial>
        <div class="link link-set">No, mantenerme aquí</div>
      </div>
    </mat-dialog-actions>
  `,
})
export default class ConfirmLeaveComponent {
  readonly componentName = "ConfirmLeaveComponent";
}
