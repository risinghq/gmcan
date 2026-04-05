import { CdkScrollable } from "@angular/cdk/scrolling";
import { Component, OnInit, inject } from "@angular/core";
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
import { createLineasInvestigacion } from "@app/shared/models/factories";
import type { LineasInvestigacion } from "@app/shared/models/lineaInvestigacion";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { LineasInvestigacionService } from "@app/shared/services/lineasinvestigacion.service";
import { ProyectoService } from "@app/shared/services/proyecto.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-edit-linea",
  templateUrl: "../add-linea/add-linea.component.html",
  styleUrl: "../add-linea/add-linea.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule, AutosizeModule],
})
export default class EditLineaComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _lineaInvestigacionService = inject(LineasInvestigacionService);
  private _proyectoService = inject(ProyectoService);

  button_text = "Actualizar información";
  lineaInvestigacion: LineasInvestigacion;
  public lineaForm: FormGroup;
  url: string;
  edit = true;

  constructor() {
    this.lineaForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcion: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcionEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.lineaInvestigacion = createLineasInvestigacion();
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    this.getLinea();
  }

  isDirty(): boolean {
    return this.lineaForm.dirty;
  }

  getLinea(): void {
    let idLineaInvestigacion = this._route.snapshot.params["id"];
    this._lineaInvestigacionService
      .getLineaInvestigacion(idLineaInvestigacion)
      .subscribe((lineas: LineasInvestigacion[]) => {
        if (lineas.length > 0) {
          this.lineaInvestigacion = lineas[0];
          localStorage.setItem("lineaInvestigacionEdit", JSON.stringify(this.lineaInvestigacion.nombre));
          this._proyectoService.getProyectosLinea(idLineaInvestigacion, 1).subscribe((proyectosActivos: any) => {
            if (proyectosActivos == 0) {
              this.notCanDo = true;
            } else {
              this.notCanDo = false;
            }
          });
          this._proyectoService.getProyectosLinea(idLineaInvestigacion, 0).subscribe((proyectosInactivos: any) => {
            if (proyectosInactivos == 0) {
              this.notCanDo = true;
            } else {
              this.notCanDo = false;
            }
          });
        }
      });
  }

  submitLinea(): void {
    this._lineaInvestigacionService.updateLinea(this.lineaInvestigacion).subscribe((result: any) => {
      if (result.status == 1) {
        if (this.fileData) {
          this._lineaInvestigacionService
            .uploadLineaFoto(this.fileData, this.lineaInvestigacion.idLineasInvestigacion ?? 0)
            .subscribe((_res: any) => {});
        }
        this.lineaForm.markAsPristine();
        this.return();
        this.openSnackBar("Linea de investigación actualizada exitosamente");
      }
    });
  }

  return(): void {
    this._router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar(value: string): void {
    this._snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  fileData: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  fileUploadProgress: string | null = null;
  uploadedFilePath: string | null = null;
  fileProgress(fileInput: Event): void {
    const target = fileInput.target as HTMLInputElement | null;
    this.fileData = target?.files?.[0] ?? null;
    if (!this.fileData) return;
    this.preview();
  }

  preview(): void {
    if (!this.fileData) return;
    // Show preview
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

  notCanDo = false;

  eraseLinea(): void {
    if (this.notCanDo) {
      this._lineaInvestigacionService
        .deleteLinea(this.lineaInvestigacion.idLineasInvestigacion ?? 0)
        .subscribe((result: any) => {
          if (result.status == 1) {
            this.lineaForm.markAsPristine();
            this.return();
            this.openSnackBar("Evento eliminado exitosamente");
          } else {
            this.openSnackBar("Hubo un problema al eliminar");
          }
        });
    }
  }

  private dialogRef2?: MatDialogRef<DialogErase11>;

  openEraser(): void {
    if (this.notCanDo) {
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
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
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
