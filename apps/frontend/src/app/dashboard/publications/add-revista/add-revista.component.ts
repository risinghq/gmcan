import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import type { JournalItem } from "@app/shared/services/ref.service";
import { RefService } from "@app/shared/services/ref.service";
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
  private _refService = inject(RefService);

  revista: JournalItem = { id: 0, name: "" };
  public revistaForm: FormGroup;
  button_text = "Guardar revista";
  notCanDo = false;
  edit = false;

  constructor() {
    this.revistaForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit(): void {}

  isDirty(): boolean {
    return this.revistaForm.dirty;
  }

  openEraser() {}

  submitRevista(): void {
    if (!this.revistaForm.valid) return;
    this._refService.createJournal({ name: this.revista.name }).subscribe((result) => {
      if (result.id) {
        this.revistaForm.markAsPristine();
        this.return();
        this.openSnackBar("Revista agregada exitosamente");
      }
    });
  }

  return(): void {
    this._router.navigate(["dashboard/articulos"]);
  }

  openSnackBar(msg = "Revista agregada exitosamente"): void {
    this._snackBar.open(msg, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}
