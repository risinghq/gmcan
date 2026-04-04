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
import type { Universidad } from "@app/shared/models/universidad";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { UniversidadService } from "@app/shared/services/universidad.service";

@Component({
  selector: "app-edit-universidad",
  templateUrl: "../add-universidad/add-universidad.component.html",
  styleUrls: ["../add-universidad/add-universidad.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgIf, NgClass],
})
export default class EditUniversidadComponent implements OnInit, HasUnsavedChanges {
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
    this.universidad = { idUniversidad: 0, nombre: "", nombreEN: "" };
    this.universidadForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  isDirty(): boolean {
    return this.universidadForm.dirty;
  }

  ngOnInit(): void {
    this.getUniversidad();
  }

  notCanDo = false;

  getUniversidad(): void {
    this._route.params.forEach((params: Params) => {
      const idUniversidad = Number(params["id"] ?? 0);
      this._universidadService.getUniversidad(idUniversidad).subscribe((result: unknown) => {
        const universidades = result as Universidad[];
        if (universidades) {
          this.universidad = universidades[0];
          localStorage.setItem("universidadEdit", JSON.stringify(this.universidad.nombre ?? ""));
          this.getPublicacionUniversidad(idUniversidad);
        }
      });
    });
  }

  getPublicacionUniversidad(idUniversidad: number): void {
    this._publicacionService.getPublicacionesUniversidad(idUniversidad).subscribe((result: unknown[]) => {
      if (result.length === 0) {
        this.notCanDo = true;
      }
    });
  }

  submitUniversidad(): void {
    this._universidadService.updateUniversidad(this.universidad).subscribe((result: { status?: number }) => {
      if (result.status === 1) {
        this.universidadForm.markAsPristine();
        this.return();
        this.openSnackBar("Universidad actualizada exitosamente");
      }
    });
  }

  return(): void {
    this._router.navigate(["dashboard/tesis"]);
  }

  openSnackBar(value: string): void {
    this._snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  private dialogRef2?: MatDialogRef<DialogErase4>;

  openEraser(): void {
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
      this.dialogRef2.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.eraseNews();
        }
      });
    }
  }

  eraseNews(): void {
    if (this.notCanDo) {
      this._universidadService
        .deleteUniversidad(this.universidad.idUniversidad ?? 0)
        .subscribe((result: { status?: number }) => {
          if (result.status === 1) {
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
  templateUrl: "../../../shared/modals/dialog-options.html",
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
