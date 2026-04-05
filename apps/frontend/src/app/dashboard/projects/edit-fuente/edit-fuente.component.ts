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
import type { FuenteFinanciamiento } from "@app/shared/models/fuentefinanciamiento";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { FuenteFinanciamientoService } from "@app/shared/services/fuentefinanciamiento.service";
import { ProyectoService } from "@app/shared/services/proyecto.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

interface StatusResponse {
  status?: number;
}

@Component({
  selector: "app-edit-fuente",
  templateUrl: "../add-fuente/add-fuente.component.html",
  styleUrl: "../add-fuente/add-fuente.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class EditFuenteComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _fuenteFinanciamientoService = inject(FuenteFinanciamientoService);
  private _proyectoService = inject(ProyectoService);

  fuente: FuenteFinanciamiento;
  public fuenteForm: FormGroup;
  button_text = "Actualizar información";
  edit = true;

  constructor() {
    this.fuente = { idFuenteFinanciamiento: 0, nombre: "" };
    this.fuenteForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit(): void {
    this.getFuente();
  }

  isDirty(): boolean {
    return this.fuenteForm.dirty;
  }

  getFuente(): void {
    const idFuente = Number(this._route.snapshot.params["id"] ?? 0);
    this._fuenteFinanciamientoService.getFuenteFinanciamiento(idFuente).subscribe((result: FuenteFinanciamiento[]) => {
      if (result.length > 0) {
        this.fuente = result[0];
        localStorage.setItem("fuenteEdit", JSON.stringify(this.fuente.nombre ?? ""));
        this.getFuenteProyecto(this.fuente);
      }
    });
  }

  notCanDo = false;

  getFuenteProyecto(fuente: FuenteFinanciamiento): void {
    this._proyectoService.getProyectoFuente(fuente.idFuenteFinanciamiento ?? 0).subscribe((result: unknown[]) => {
      if (result.length == 0) {
        this.notCanDo = true;
      }
    });
  }

  submitFuente(): void {
    if (this.fuenteForm.valid) {
      this._fuenteFinanciamientoService.updateFuenteFinanciamiento(this.fuente).subscribe((result: StatusResponse) => {
        if (result.status == 1) {
          this.fuenteForm.markAsPristine();
          this.return();
          this.openSnackBar("Fuente de financiamiento actualizada exitosamente");
        }
      });
    }
  }

  return(): void {
    this._router.navigate(["dashboard/proyectos-ejecucion"]);
  }

  openSnackBar(value: string): void {
    this._snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  private dialogRef2?: MatDialogRef<DialogErase9>;

  openEraser(): void {
    if (this.notCanDo) {
      this.dialogRef2 = this.dialog.open(DialogErase9, {
        width: "530px",
        id: "idleTimer",
        data: {
          title: "Eliminar fuente de financiamiento",
          text: "¿Estás seguro que deseas eliminar esta fuente?",
          cancel: "Sí, eliminar",
          yes: "No, cancelar",
        },
      });
      this.dialogRef2.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.eraseNews();
        }
      });
    }
  }

  eraseNews(): void {
    if (this.notCanDo) {
      this._fuenteFinanciamientoService
        .deleteFuenteFinanciamiento(this.fuente.idFuenteFinanciamiento ?? 0)
        .subscribe((result: StatusResponse) => {
          if (result.status == 1) {
            this.fuenteForm.markAsPristine();
            this.return();
            this.openSnackBar("Fuente de financiamiento eliminada exitosamente");
          } else {
            this.openSnackBar("Hubo un problema al eliminar");
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
export class DialogErase9 {
  dialogRef = inject<MatDialogRef<DialogErase9>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
