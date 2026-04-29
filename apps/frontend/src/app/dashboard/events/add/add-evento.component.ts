import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { EventService, type EventBody } from "@app/shared/services/event.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

@Component({
  selector: "app-add-evento",
  templateUrl: "./add-evento.component.html",
  styleUrl: "./add-evento.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule, MatFormField, MatInput, MatLabel],
})
export default class AddEventoComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _eventService = inject(EventService);

  evento: EventBody & { id?: number };
  public eventoForm: FormGroup;
  button_text = "Guardar evento";

  constructor() {
    this.evento = { name: "", country: "", countryEN: "", city: "", cityEN: "" };
    this.eventoForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      pais: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      paisEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      ciudad: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      ciudadEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit(): void {}

  isDirty(): boolean {
    return this.eventoForm.dirty;
  }

  submitEvento(): void {
    if (this.eventoForm.valid) {
      this._eventService.create(this.evento).subscribe((result) => {
        if (result.id) {
          this.eventoForm.markAsPristine();
          this.return();
          this.openSnackBar();
        }
      });
    }
  }

  return(): void {
    this._router.navigate(["dashboard/eventos"]);
  }

  openSnackBar(): void {
    this._snackBar.open("Evento agregado exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  notCanDo = false;
  openEraser() {}
  edit = false;
}
