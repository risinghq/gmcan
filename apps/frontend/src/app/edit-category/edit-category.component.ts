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
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { DialogData } from "../models/dialogdata";
import { TipoNoticia } from "../models/tiponoticia";
import { HasUnsavedChanges } from "../models/unsaved-changes";
import { NoticiaService } from "../services/noticia.service";
import { SpaceValidator } from "../services/spacevalidator";
import { TipoNoticiaService } from "../services/tiponoticia.service";

@Component({
  selector: "app-edit-category",
  templateUrl: "../add-category/add-category.component.html",
  styleUrls: ["../add-category/add-category.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgIf, NgClass],
})
export class EditCategoryComponent implements OnInit, HasUnsavedChanges {
  category: TipoNoticia;
  public categoryForm: FormGroup;
  button_text = "Actualizar categoría";
  edit = true;
  idCategory;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    public _tipoNoticiaService: TipoNoticiaService,
    public _noticiaService: NoticiaService,
    private _snackBar: MatSnackBar,
  ) {
    this.categoryForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.category = new TipoNoticia(null, "", "");
  }

  ngOnInit() {
    this.getCategory();
  }

  getCategory() {
    this._route.params.forEach((params: Params) => {
      this.idCategory = params["id"];
      this._tipoNoticiaService.getTipoNews(this.idCategory).subscribe((result) => {
        if (result[0]) {
          this.category = result[0];
          localStorage.setItem("categoryEdit", JSON.stringify(this.category.nombre));
        }
        this.getRelatedNews();
      });
    });
  }

  notCanDo;

  getRelatedNews() {
    this._noticiaService.getNoticiaTipo(this.idCategory).subscribe((result) => {
      if (result.length > 0) {
        this.notCanDo = false;
      } else {
        this.notCanDo = true;
      }
    });
  }

  isDirty(): boolean {
    return this.categoryForm.dirty;
  }

  return() {
    this._router.navigate(["dashboard/noticias"]);
  }

  submitCategory() {
    if (this.categoryForm.valid) {
      this._tipoNoticiaService.updateCategory(this.category).subscribe((result) => {
        if (result.status == 1) {
          this.categoryForm.markAsPristine();
          this.return();
          this.openSnackBar("Categoría actualizada exitosamente");
        }
      });
    }
  }

  openSnackBar(text) {
    this._snackBar.open(text, null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  private dialogRef: MatDialogRef<DialogErase>;

  openEraser() {
    if (this.notCanDo) {
      this.dialogRef = this.dialog.open(DialogErase, {
        width: "530px",
        id: "idleTimer",
        data: {
          title: "Eliminar categoría",
          text: "¿Estás seguro que deseas eliminar esta categoría?",
          cancel: "Sí, eliminar",
          yes: "No, cancelar",
        },
      });

      this.dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.eraseCategory();
        }
      });
    }
  }

  eraseCategory() {
    this._noticiaService.getNoticiaTipo(this.idCategory).subscribe((result) => {
      if (result.length == 0) {
        this._tipoNoticiaService.deleteCategory(this.idCategory).subscribe((result) => {
          if (result.status == 1) {
            this.categoryForm.markAsPristine();
            this.return();
            this.openSnackBar("Categoría eliminada exitosamente");
          } else {
            this.openSnackBar("Hubo un problema al eliminar");
          }
        });
      }
    });
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../modals/dialog-options.html",
  imports: [MatDialogTitle, NgIf, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase {
  constructor(
    public dialogRef: MatDialogRef<DialogErase>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
