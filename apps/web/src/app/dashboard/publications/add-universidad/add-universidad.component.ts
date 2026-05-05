import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import type { UniversityItem } from "@app/shared/services/ref.service";
import { RefService } from "@app/shared/services/ref.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

@Component({
  selector: "app-add-universidad",
  templateUrl: "./add-universidad.component.html",
  styleUrl: "./add-universidad.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class AddUniversidadComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private refService = inject(RefService);

  universidad: UniversityItem = { id: 0, name: "" };
  public universidadForm: FormGroup;
  button_text = "Guardar universidad";
  notCanDo = false;
  edit = false;

  constructor() {
    this.universidadForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  isDirty(): boolean {
    return this.universidadForm.dirty;
  }

  ngOnInit() {}

  submitUniversidad(): void {
    if (!this.universidadForm.valid) return;
    this.refService.createUniversity({ name: this.universidad.name }).subscribe((result) => {
      if (result.id) {
        this.universidadForm.markAsPristine();
        this.return();
        this.openSnackBar("Universidad agregada exitosamente");
      }
    });
  }

  return(): void {
    this.router.navigate(["dashboard/tesis"]);
  }

  openSnackBar(msg = "Universidad agregada exitosamente"): void {
    this.snackBar.open(msg, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  openEraser() {}
}
