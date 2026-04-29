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
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _refService = inject(RefService);

  universidad: UniversityItem = { id: 0, name: null, nameEN: null };
  public universidadForm: FormGroup;
  button_text = "Guardar universidad";
  notCanDo = false;
  edit = false;

  constructor() {
    this.universidadForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  isDirty(): boolean {
    return this.universidadForm.dirty;
  }

  ngOnInit() {}

  submitUniversidad(): void {
    if (!this.universidadForm.valid) return;
    this._refService
      .createUniversity({ name: this.universidad.name ?? "", nameEN: this.universidad.nameEN ?? undefined })
      .subscribe((result) => {
        if (result.id) {
          this.universidadForm.markAsPristine();
          this.return();
          this.openSnackBar("Universidad agregada exitosamente");
        }
      });
  }

  return(): void {
    this._router.navigate(["dashboard/tesis"]);
  }

  openSnackBar(msg = "Universidad agregada exitosamente"): void {
    this._snackBar.open(msg, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  openEraser() {}
}
