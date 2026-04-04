import { NgClass } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import type { FuenteFinanciamiento } from "@app/shared/models/fuentefinanciamiento";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { FuenteFinanciamientoService } from "@app/shared/services/fuentefinanciamiento.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

@Component({
  selector: "app-add-fuente",
  templateUrl: "./add-fuente.component.html",
  styleUrls: ["./add-fuente.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgClass],
})
export default class AddFuenteComponent implements OnInit, HasUnsavedChanges {
  fuente: FuenteFinanciamiento;
  public fuenteForm: FormGroup;
  button_text = "Guardar fuente";

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _fuenteFinanciamientoService: FuenteFinanciamientoService,
  ) {
    this.fuente = { idFuenteFinanciamiento: 0, nombre: "" };
    this.fuenteForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
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
    this._fuenteFinanciamientoService.addFuenteFinanciamiento(this.fuente).subscribe((result: { status?: number }) => {
      if (result.status == 1) {
        this.fuenteForm.markAsPristine();
        this.return();
        this.openSnackBar();
      }
    });
  }

  return(): void {
    this._router.navigate(["dashboard/proyectos-ejecucion"]);
  }

  openSnackBar(): void {
    this._snackBar.open("Fuente agregada exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}
