import { NgClass } from "@angular/common";
import { Component, OnInit, HostListener, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import type { TipoNoticia } from "@app/shared/models/tiponoticia";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { TipoNoticiaService } from "@app/shared/services/tiponoticia.service";

@Component({
  selector: "app-add-category",
  templateUrl: "./add-category.component.html",
  styleUrls: ["./add-category.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgClass],
})
export default class AddCategoryComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  _tipoNoticiaService = inject(TipoNoticiaService);
  private _snackBar = inject(MatSnackBar);

  category: TipoNoticia;
  public categoryForm: FormGroup;
  button_text = "Agregar categoría";
  notCanDo = false;
  constructor() {
    this.categoryForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.category = { idtipoNoticia: 0, nombre: "", nombreEN: "" };
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.returnValue = false;
  }

  ngOnInit(): void {}

  isDirty(): boolean {
    return this.categoryForm.dirty;
  }

  return(): void {
    this._router.navigate(["dashboard/noticias"]);
  }

  submitCategory(): void {
    if (this.categoryForm.valid) {
      this._tipoNoticiaService.addCategory(this.category).subscribe((result: { status?: number }) => {
        if (result.status == 1) {
          this.categoryForm.markAsPristine();
          this.return();
          this.openSnackBar();
        }
      });
    }
  }

  openSnackBar(): void {
    this._snackBar.open("Categoría agregada exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  edit = false;

  openEraser() {}
}
