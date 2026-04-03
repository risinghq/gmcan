import { CdkScrollable } from "@angular/cdk/scrolling";
import { NgIf, NgClass } from "@angular/common";
import { Component, OnInit, Inject } from "@angular/core";
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
import { ActivatedRoute, Router, Params } from "@angular/router";
import { DialogData } from "@app/shared/models/dialogdata";
import { FuenteFinanciamiento } from "@app/shared/models/fuentefinanciamiento";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { FuenteFinanciamientoService } from "@app/shared/services/fuentefinanciamiento.service";
import { ProyectoService } from "@app/shared/services/proyecto.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-edit-fuente",
  templateUrl: "../add-fuente/add-fuente.component.html",
  styleUrls: ["../add-fuente/add-fuente.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgIf, NgClass],
})
export default class EditFuenteComponent implements OnInit, HasUnsavedChanges {
  fuente: FuenteFinanciamiento;
  public fuenteForm: FormGroup;
  button_text = "Actualizar información";
  edit = true;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _fuenteFinanciamientoService: FuenteFinanciamientoService,
    private _proyectoService: ProyectoService,
  ) {
    this.fuente = new FuenteFinanciamiento(null, "");
    this.fuenteForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit() {
    this.getFuente();
  }

  isDirty(): boolean {
    return this.fuenteForm.dirty;
  }

  getFuente() {
    this._route.params.forEach((params: Params) => {
      let idFuente = params["id"];
      this._fuenteFinanciamientoService.getFuenteFinanciamiento(idFuente).subscribe((result) => {
        if (result.length > 0) {
          this.fuente = result[0];
          localStorage.setItem("fuenteEdit", JSON.stringify(this.fuente.nombre));
          this.getFuenteProyecto(this.fuente);
        }
      });
    });
  }

  notCanDo = false;

  getFuenteProyecto(fuente) {
    this._proyectoService.getProyectoFuente(fuente.idFuenteFinanciamiento).subscribe((result) => {
      if (result.length == 0) {
        this.notCanDo = true;
      }
    });
  }

  submitFuente() {
    if (this.fuenteForm.valid) {
      this._fuenteFinanciamientoService.updateFuenteFinanciamiento(this.fuente).subscribe((result) => {
        if (result.status == 1) {
          this.fuenteForm.markAsPristine();
          this.return();
          this.openSnackBar("Fuente de financiamiento actualizada exitosamente");
        }
      });
    }
  }

  return() {
    this._router.navigate(["dashboard/proyectos-ejecucion"]);
  }

  openSnackBar(value) {
    this._snackBar.open(value, null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  private dialogRef2: MatDialogRef<DialogErase9>;

  openEraser() {
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
      this.dialogRef2.afterClosed().subscribe((result) => {
        if (result) {
          this.eraseNews();
        }
      });
    }
  }

  eraseNews() {
    if (this.notCanDo) {
      this._fuenteFinanciamientoService
        .deleteFuenteFinanciamiento(this.fuente.idFuenteFinanciamiento)
        .subscribe((result) => {
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
  imports: [MatDialogTitle, NgIf, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase9 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase9>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
