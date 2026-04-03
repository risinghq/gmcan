import { NgIf, NgClass } from "@angular/common";
import { Component, OnInit, HostListener } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { TipoNoticia } from "@app/shared/models/tiponoticia";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { TipoNoticiaService } from "@app/shared/services/tiponoticia.service";

@Component({
  selector: "app-add-category",
  templateUrl: "./add-category.component.html",
  styleUrls: ["./add-category.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgIf, NgClass],
})
export default class AddCategoryComponent implements OnInit, HasUnsavedChanges {
  category: TipoNoticia;
  public categoryForm: FormGroup;
  button_text = "Agregar categoría";
  notCanDo;
  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    public _tipoNoticiaService: TipoNoticiaService,
    private _snackBar: MatSnackBar,
  ) {
    this.categoryForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.category = new TipoNoticia(null, "", "");
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.returnValue = false;
  }

  ngOnInit() {}

  isDirty(): boolean {
    return this.categoryForm.dirty;
  }

  return() {
    this._router.navigate(["dashboard/noticias"]);
  }

  submitCategory() {
    if (this.categoryForm.valid) {
      this._tipoNoticiaService.addCategory(this.category).subscribe((result) => {
        if (result.status == 1) {
          this.categoryForm.markAsPristine();
          this.return();
          this.openSnackBar();
        }
      });
    }
  }

  openSnackBar() {
    this._snackBar.open("Categoría agregada exitosamente", null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  edit;

  openEraser() {}
}
