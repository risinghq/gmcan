import { Component, OnInit, HostListener, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { RefService } from "@app/shared/services/ref.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

@Component({
  selector: "app-add-category",
  templateUrl: "./add-category.component.html",
  styleUrl: "./add-category.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class AddCategoryComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private refService = inject(RefService);
  private snackBar = inject(MatSnackBar);

  category = { id: 0, name: "", nameEN: "" };
  public categoryForm: FormGroup;
  button_text = "Agregar categoría";
  notCanDo = false;

  constructor() {
    this.categoryForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.returnValue = false;
  }

  ngOnInit(): void {}

  isDirty(): boolean {
    return this.categoryForm.dirty;
  }

  return(): void {
    this.router.navigate(["dashboard/noticias"]);
  }

  submitCategory(): void {
    if (this.categoryForm.valid) {
      this.refService.createNewsType({ name: this.category.name, nameEN: this.category.nameEN }).subscribe((result) => {
        if (result.id) {
          this.categoryForm.markAsPristine();
          this.return();
          this.openSnackBar("Categoría agregada exitosamente");
        }
      });
    }
  }

  openSnackBar(msg: string): void {
    this.snackBar.open(msg, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  edit = false;

  openEraser() {}
}
