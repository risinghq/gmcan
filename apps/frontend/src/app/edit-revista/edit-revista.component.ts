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
import { Revista } from "../models/revista";
import { HasUnsavedChanges } from "../models/unsaved-changes";
import { PublicacionService } from "../services/publicacion.service";
import { RevistaService } from "../services/revista.service";
import { SpaceValidator } from "../services/spacevalidator";

@Component({
  selector: "app-edit-revista",
  templateUrl: "../add-revista/add-revista.component.html",
  styleUrls: ["../add-revista/add-revista.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgIf, NgClass],
})
export class EditRevistaComponent implements OnInit, HasUnsavedChanges {
  revista: Revista;
  public revistaForm: FormGroup;
  button_text = "Actualizar revista";
  edit = true;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _revistaService: RevistaService,
    private _publicacionService: PublicacionService,
  ) {
    this.revista = new Revista(null, "");
    this.revistaForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit() {
    this.getRevista();
  }

  isDirty(): boolean {
    return this.revistaForm.dirty;
  }

  getRevista() {
    this._route.params.forEach((params: Params) => {
      let idRevista = params["id"];
      this._revistaService.getRevista(idRevista).subscribe((result) => {
        if (result) {
          this.revista = result[0];
          localStorage.setItem("revistaEdit", JSON.stringify(this.revista.nombre));
          this.getPublicacionRevista(idRevista);
        }
      });
    });
  }

  notCanDo;

  getPublicacionRevista(idRevista) {
    this._publicacionService.getPublicacionesRevista(idRevista).subscribe((result) => {
      if (result.length == 0) {
        this.notCanDo = true;
      }
    });
  }

  submitRevista() {
    this._revistaService.updateRevista(this.revista).subscribe((result) => {
      if (result.status == 1) {
        this.revistaForm.markAsPristine();
        this.return();
        this.openSnackBar("Revista actualizada exitosamente");
      }
    });
  }

  return() {
    this._router.navigate(["dashboard/articulos"]);
  }

  private dialogRef2: MatDialogRef<DialogErase3>;

  openEraser() {
    if (this.notCanDo) {
      this.dialogRef2 = this.dialog.open(DialogErase3, {
        width: "530px",
        id: "idleTimer",
        data: {
          title: "Eliminar noticia",
          text: "¿Estás seguro que deseas eliminar esta noticia?",
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

  openSnackBar(value) {
    this._snackBar.open(value, null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  eraseNews() {
    if (this.notCanDo) {
      this._revistaService.deleteRevista(this.revista.idRevista).subscribe((result) => {
        if (result.status == 1) {
          this.revistaForm.markAsPristine();
          this.return();
          this.openSnackBar("Revista eliminada exitosamente");
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
export class DialogErase3 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase3>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
