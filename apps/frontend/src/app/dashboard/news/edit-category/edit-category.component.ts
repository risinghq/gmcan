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
import type { TipoNoticia } from "@app/shared/models/tiponoticia";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { AdminTipoNoticiaService } from "@app/shared/services/admin-tiponoticia.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { NoticiaService } from "@app/shared/services/noticia.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

interface StatusResponse {
  status?: number;
}

@Component({
  selector: "app-edit-category",
  templateUrl: "../add-category/add-category.component.html",
  styleUrl: "../add-category/add-category.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class EditCategoryComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private _adminTipoNoticiaService = inject(AdminTipoNoticiaService);
  private lookup = inject(LookupService);
  _noticiaService = inject(NoticiaService);
  private _snackBar = inject(MatSnackBar);

  category: TipoNoticia;
  public categoryForm: FormGroup;
  button_text = "Actualizar categoría";
  edit = true;
  idCategory = 0;

  constructor() {
    this.categoryForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.category = { idtipoNoticia: 0, nombre: "", nombreEN: "" };
  }

  ngOnInit(): void {
    this.getCategory();
  }

  getCategory(): void {
    this.idCategory = Number(this._route.snapshot.params["id"] ?? 0);
    const found = this.lookup.tiposNoticia().find((t) => t.idtipoNoticia === this.idCategory);
    if (found) {
      this.category = found as TipoNoticia;
      localStorage.setItem("categoryEdit", JSON.stringify(this.category.nombre ?? ""));
    }
    this.getRelatedNews();
  }

  notCanDo = false;

  getRelatedNews(): void {
    this._noticiaService.getNoticiaTipo(this.idCategory).subscribe((result: unknown[]) => {
      this.notCanDo = result.length === 0;
    });
  }

  isDirty(): boolean {
    return this.categoryForm.dirty;
  }

  return(): void {
    this._router.navigate(["dashboard/noticias"]);
  }

  submitCategory(): void {
    if (this.categoryForm.valid) {
      this._adminTipoNoticiaService.updateCategory(this.category).subscribe((result: StatusResponse) => {
        if (result.status == 1) {
          this.categoryForm.markAsPristine();
          this.return();
          this.openSnackBar("Categoría actualizada exitosamente");
        }
      });
    }
  }

  openSnackBar(text: string): void {
    this._snackBar.open(text, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  private dialogRef?: MatDialogRef<DialogErase>;

  openEraser(): void {
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

      this.dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.eraseCategory();
        }
      });
    }
  }

  eraseCategory(): void {
    this._noticiaService.getNoticiaTipo(this.idCategory).subscribe((newsByCategory: unknown[]) => {
      if (newsByCategory.length == 0) {
        this._adminTipoNoticiaService.deleteCategory(this.idCategory).subscribe((deleteResponse: StatusResponse) => {
          if (deleteResponse.status == 1) {
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
  templateUrl: "../../../shared/modals/dialog-options.html",
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase {
  dialogRef = inject<MatDialogRef<DialogErase>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
