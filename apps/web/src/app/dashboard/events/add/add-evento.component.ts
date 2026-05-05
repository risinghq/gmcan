import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { EventService, type EventBody } from "@app/shared/services/event.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

@Component({
  selector: "app-add-evento",
  templateUrl: "./add-evento.component.html",
  styleUrl: "./add-evento.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class AddEventoComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private eventService = inject(EventService);

  evento: EventBody & { id?: number };
  public eventoForm: FormGroup;
  button_text = "Guardar evento";

  constructor() {
    this.evento = { name: "", country: "", city: "" };
    this.eventoForm = this.formBuilder.group({
      name: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      country: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      city: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit(): void {}

  isDirty(): boolean {
    return this.eventoForm.dirty;
  }

  submitEvento(): void {
    if (this.eventoForm.valid) {
      this.eventService.create(this.evento).subscribe((result) => {
        if (result.id) {
          this.eventoForm.markAsPristine();
          this.return();
          this.openSnackBar();
        }
      });
    }
  }

  return(): void {
    this.router.navigate(["dashboard/eventos"]);
  }

  openSnackBar(): void {
    this.snackBar.open("Evento agregado exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  notCanDo = false;
  openEraser() {}
  edit = false;
}
