import { CdkScrollable } from "@angular/cdk/scrolling";
import { Component, OnInit, inject, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogData } from "@app/shared/models/dialogdata";
import { createResearchLine } from "@app/shared/models/factories";
import type { ResearchLine } from "@app/shared/models/research-line";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-edit-linea",
  templateUrl: "../add-linea/add-linea.component.html",
  styleUrl: "../add-linea/add-linea.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon, FormsModule, ReactiveFormsModule, AutosizeModule],
})
export default class EditLineaComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private researchLinesService = inject(ResearchLinesService);

  button_text = "Actualizar información";
  lineaInvestigacion: ResearchLine;
  public lineaForm: FormGroup;
  url: string;
  edit = true;
  notCanDo = true;

  constructor() {
    this.lineaForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcion: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.lineaInvestigacion = createResearchLine();
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    this.getLinea();
  }

  isDirty(): boolean {
    return this.lineaForm.dirty;
  }

  getLinea(): void {
    const idLinea = Number(this.route.snapshot.params["id"]);
    this.researchLinesService.get(idLinea).subscribe((linea: ResearchLine) => {
      if (linea) {
        this.lineaInvestigacion = linea;
      }
    });
  }

  submitLinea(): void {
    if (this.lineaForm.valid) {
      this.researchLinesService
        .update(this.lineaInvestigacion.id, {
          name: this.lineaInvestigacion.name,
          description: this.lineaInvestigacion.description ?? undefined,
        })
        .subscribe((result) => {
          if (result.status === 1) {
            if (this.fileData) {
              this.researchLinesService.uploadAsset(this.lineaInvestigacion.id, this.fileData).subscribe();
            }
            this.lineaForm.markAsPristine();
            this.return();
            this.openSnackBar("Linea de investigación actualizada exitosamente");
          }
        });
    }
  }

  return(): void {
    this.router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar(value: string): void {
    this.snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  fileData: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  fileProgress(fileInput: Event): void {
    const target = fileInput.target as HTMLInputElement | null;
    this.fileData = target?.files?.[0] ?? null;
    if (!this.fileData) return;
    this.preview();
  }

  preview(): void {
    if (!this.fileData) return;
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.addEventListener("load", (_event) => {
      this.previewUrl = reader.result;
    });
  }

  eraseLinea(): void {
    this.researchLinesService.delete(this.lineaInvestigacion.id).subscribe((result) => {
      if (result.status === 1) {
        this.lineaForm.markAsPristine();
        this.return();
        this.openSnackBar("Línea de investigación eliminada exitosamente");
      } else {
        this.openSnackBar("Hubo un problema al eliminar");
      }
    });
  }

  private dialogRef2?: MatDialogRef<DialogErase11>;

  openEraser(): void {
    this.dialogRef2 = this.dialog.open(DialogErase11, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "Eliminar línea de investigación",
        text: "¿Estás seguro que deseas eliminar esta línea?",
        cancel: "Sí, eliminar",
        yes: "No, cancelar",
      },
    });
    this.dialogRef2.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.eraseLinea();
      }
    });
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase11 {
  dialogRef = inject<MatDialogRef<DialogErase11>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
