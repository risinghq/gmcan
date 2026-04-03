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

import { DialogData } from "../models/dialogdata";
import { Universidad } from "../models/universidad";
import { HasUnsavedChanges } from "../models/unsaved-changes";
import { PublicacionService } from "../services/publicacion.service";
import { SpaceValidator } from "../services/spacevalidator";
import { UniversidadService } from "../services/universidad.service";

@Component({
  selector: "app-edit-universidad",
  templateUrl: "../add-universidad/add-universidad.component.html",
  styleUrls: ["../add-universidad/add-universidad.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgIf, NgClass],
})
export class EditUniversidadComponent implements OnInit, HasUnsavedChanges {
  universidad: Universidad;
  public universidadForm: FormGroup;
  button_text = "Guardar universidad";
  edit = true;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _universidadService: UniversidadService,
    private _publicacionService: PublicacionService,
  ) {
    this.universidad = new Universidad(null, "", "", null, null);
    this.universidadForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  isDirty(): boolean {
    return this.universidadForm.dirty;
  }

  ngOnInit() {
    this.getUniversidad();
  }

  notCanDo;

  getUniversidad() {
    this._route.params.forEach((params: Params) => {
      let idUniversidad = params["id"];
      this._universidadService.getUniversidad(idUniversidad).subscribe((result) => {
        if (result) {
          this.universidad = result[0];
          localStorage.setItem("universidadEdit", JSON.stringify(this.universidad.nombre));
          this.getPublicacionUniversidad(idUniversidad);
        }
      });
    });
  }

  getPublicacionUniversidad(idUniversidad) {
    this._publicacionService.getPublicacionesUniversidad(idUniversidad).subscribe((result) => {
      if (result.length == 0) {
        this.notCanDo = true;
      }
    });
  }

  submitUniversidad() {
    this._universidadService.updateUniversidad(this.universidad).subscribe((result) => {
      if (result.status == 1) {
        this.universidadForm.markAsPristine();
        this.return();
        this.openSnackBar("Universidad actualizada exitosamente");
      }
    });
  }

  return() {
    this._router.navigate(["dashboard/tesis"]);
  }

  openSnackBar(value) {
    this._snackBar.open(value, null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  private dialogRef2: MatDialogRef<DialogErase4>;

  openEraser() {
    if (this.notCanDo) {
      this.dialogRef2 = this.dialog.open(DialogErase4, {
        width: "530px",
        id: "idleTimer",
        data: {
          title: "Eliminar universidad",
          text: "¿Estás seguro que deseas eliminar esta universidad?",
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
      this._universidadService.deleteUniversidad(this.universidad.idUniversidad).subscribe((result) => {
        if (result.status == 1) {
          this.universidadForm.markAsPristine();
          this.return();
          this.openSnackBar("Universidad eliminada exitosamente");
        } else {
          this.openSnackBar("Hubo un problema al eliminar");
        }
      });
    }
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../modals/dialog-options.html",
  imports: [MatDialogTitle, NgIf, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase4 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase4>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
