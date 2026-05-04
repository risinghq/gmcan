import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { RefService } from "@app/shared/services/ref.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

@Component({
  selector: "app-add-fuente",
  templateUrl: "./add-fuente.component.html",
  styleUrl: "./add-fuente.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class AddFuenteComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private refService = inject(RefService);

  fuente = { id: 0, name: "" };
  public fuenteForm: FormGroup;
  button_text = "Guardar fuente";

  constructor() {
    this.fuenteForm = this.formBuilder.group({
      name: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit() {}

  isDirty(): boolean {
    return this.fuenteForm.dirty;
  }

  notCanDo = false;
  openEraser() {}
  edit = false;

  submitFuente(): void {
    if (this.fuenteForm.valid) {
      this.refService.createFundingSource({ name: this.fuente.name }).subscribe((result) => {
        if (result.id) {
          this.fuenteForm.markAsPristine();
          this.return();
          this.openSnackBar("Fuente agregada exitosamente");
        }
      });
    }
  }

  return(): void {
    this.router.navigate(["dashboard/proyectos-ejecucion"]);
  }

  openSnackBar(value: string): void {
    this.snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}
