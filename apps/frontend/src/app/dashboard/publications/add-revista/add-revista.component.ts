import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import type { Revista } from "@app/shared/models/revista";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { RevistaService } from "@app/shared/services/revista.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

@Component({
  selector: "app-add-revista",
  templateUrl: "./add-revista.component.html",
  styleUrl: "./add-revista.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class AddRevistaComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _revistaService = inject(RevistaService);

  revista: Revista;
  public revistaForm: FormGroup;
  button_text = "Guardar revista";

  constructor() {
    this.revista = { idRevista: 0, nombre: "" };
    this.revistaForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit(): void {}

  isDirty(): boolean {
    return this.revistaForm.dirty;
  }

  notCanDo = false;
  edit = false;
  openEraser() {}

  submitRevista(): void {
    this._revistaService.addRevista(this.revista).subscribe((result: { status?: number }) => {
      if (result.status == 1) {
        this.revistaForm.markAsPristine();
        this.return();
        this.openSnackBar();
      }
    });
  }

  return(): void {
    this._router.navigate(["dashboard/articulos"]);
  }

  openSnackBar(): void {
    this._snackBar.open("Revista agregada exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}
