import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import type { Universidad } from "@app/shared/models/universidad";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { UniversidadService } from "@app/shared/services/universidad.service";

interface StatusResponse {
  status?: number;
}

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
  private _universidadService = inject(UniversidadService);

  universidad: Universidad;
  public universidadForm: FormGroup;
  button_text = "Guardar universidad";
  notCanDo = false;

  constructor() {
    this.universidad = { idUniversidad: 0, nombre: "", nombreEN: "" };
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
    this._universidadService.addUniversidad(this.universidad).subscribe((result: StatusResponse) => {
      if (result.status == 1) {
        this.universidadForm.markAsPristine();
        this.return();
        this.openSnackBar();
      }
    });
  }

  return(): void {
    this._router.navigate(["dashboard/tesis"]);
  }

  openSnackBar(): void {
    this._snackBar.open("Universidad agregada exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  openEraser() {}
  edit = false;
}
