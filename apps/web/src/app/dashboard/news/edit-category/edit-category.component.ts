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
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import type { RefItem } from "@app/shared/services/ref.service";
import { RefService } from "@app/shared/services/ref.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

import { NewsCategoryUsecase } from "./news-category.usecase";

@Component({
  selector: "app-edit-category",
  templateUrl: "../add-category/add-category.component.html",
  styleUrl: "../add-category/add-category.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class EditCategoryComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  dialog = inject(MatDialog);
  private readonly refService = inject(RefService);
  private readonly newsCategoryUsecase = inject(NewsCategoryUsecase);
  private readonly snackBar = inject(MatSnackBar);

  category: RefItem = { id: 0, name: "" };
  public categoryForm: FormGroup;
  button_text = "Actualizar categoría";
  edit = true;
  idCategory = 0;

  constructor() {
    this.categoryForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit(): void {
    this.getCategory();
  }

  getCategory(): void {
    this.idCategory = Number(this.route.snapshot.params["id"] ?? 0);
    this.refService.listNewsTypes().subscribe((types) => {
      const found = types.find((t) => t.id === this.idCategory);
      if (found) {
        this.category = found;
        this.getRelatedNews();
      }
    });
  }

  notCanDo = false;

  getRelatedNews(): void {
    this.newsCategoryUsecase.canDelete(this.idCategory).subscribe((canDelete) => {
      this.notCanDo = canDelete;
    });
  }

  isDirty(): boolean {
    return this.categoryForm.dirty;
  }

  return(): void {
    this.router.navigate(["dashboard/news"]);
  }

  submitCategory(): void {
    if (this.categoryForm.valid) {
      this.refService.updateNewsType(this.idCategory, { name: this.category.name }).subscribe((result) => {
        if (result.status === 1) {
          this.categoryForm.markAsPristine();
          this.return();
          this.openSnackBar("Categoría actualizada exitosamente");
        }
      });
    }
  }

  openSnackBar(text: string): void {
    this.snackBar.open(text, undefined, {
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
    this.newsCategoryUsecase.deleteIfAllowed(this.idCategory).subscribe((result) => {
      if (result.deleted) {
        this.categoryForm.markAsPristine();
        this.return();
        this.openSnackBar("Categoría eliminada exitosamente");
      } else {
        this.openSnackBar("Hubo un problema al eliminar");
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
export class DialogErase {
  dialogRef = inject<MatDialogRef<DialogErase>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    this.dialogRef.disableClose = true;
  }
}
