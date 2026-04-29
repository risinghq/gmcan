import { CdkScrollable } from "@angular/cdk/scrolling";
import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from "@angular/material/dialog";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogData } from "@app/shared/models/dialogdata";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { EventService, type EventItem } from "@app/shared/services/event.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

@Component({
  selector: "app-edit-evento",
  templateUrl: "../add/add-evento.component.html",
  styleUrl: "../add/add-evento.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule, MatFormField, MatInput, MatLabel],
})
export default class EditEventoComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _eventService = inject(EventService);
  private _publicationService = inject(PublicationService);

  evento: EventItem;
  public eventoForm: FormGroup;
  button_text = "Actualizar evento";
  edit = true;

  constructor() {
    this.evento = { id: 0, name: "", country: null, countryEN: null, city: null, cityEN: null };
    this.eventoForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      pais: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      paisEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      ciudad: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      ciudadEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit(): void {
    this.getEvento();
  }

  getEvento(): void {
    const idEvento = Number(this._route.snapshot.params["id"]);
    this._eventService.get(idEvento).subscribe((result: EventItem) => {
      if (result) {
        this.evento = result;
        localStorage.setItem("eventoEdit", JSON.stringify(result.name));
        this.checkCanDelete(idEvento);
      }
    });
  }

  isDirty(): boolean {
    return this.eventoForm.dirty;
  }

  notCanDo = false;

  checkCanDelete(idEvento: number): void {
    this._publicationService.listPublications({ event: idEvento }).subscribe((result) => {
      if (result.length === 0) {
        this.notCanDo = true;
      }
    });
  }

  submitEvento(): void {
    if (this.eventoForm.valid) {
      this._eventService
        .update(this.evento.id, {
          name: this.evento.name,
          city: this.evento.city ?? undefined,
          country: this.evento.country ?? undefined,
          cityEN: this.evento.cityEN ?? undefined,
          countryEN: this.evento.countryEN ?? undefined,
        })
        .subscribe((result) => {
          if (result.status === 1) {
            this.eventoForm.markAsPristine();
            this.return();
            this.openSnackBar("Evento actualizado exitosamente");
          }
        });
    }
  }

  return(): void {
    this._router.navigate(["dashboard/eventos"]);
  }

  openSnackBar(value: string): void {
    this._snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  private dialogRef2?: MatDialogRef<DialogErase5>;

  openEraser(): void {
    if (this.notCanDo) {
      this.dialogRef2 = this.dialog.open(DialogErase5, {
        width: "530px",
        id: "idleTimer",
        data: {
          title: "Eliminar evento",
          text: "¿Estás seguro que deseas eliminar este evento?",
          cancel: "Sí, eliminar",
          yes: "No, cancelar",
        },
      });
      this.dialogRef2.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.eraseEvento();
        }
      });
    }
  }

  eraseEvento(): void {
    if (this.notCanDo) {
      this._eventService.delete(this.evento.id).subscribe((result) => {
        if (result.status === 1) {
          this.eventoForm.markAsPristine();
          this.return();
          this.openSnackBar("Evento eliminado exitosamente");
        } else {
          this.openSnackBar("Hubo un problema al eliminar");
        }
      });
    }
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase5 {
  dialogRef = inject<MatDialogRef<DialogErase5>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
