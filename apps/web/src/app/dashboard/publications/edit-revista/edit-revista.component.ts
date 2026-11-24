import { CdkScrollable } from "@angular/cdk/scrolling";
import { Component, OnInit, inject, ChangeDetectionStrategy } from "@angular/core";
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
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogData } from "@app/shared/models/dialogdata";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import type { JournalItem } from "@app/shared/services/ref.service";
import { RefService } from "@app/shared/services/ref.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import type { RefDependenciesResponse } from "@gmcan/contracts/admin";

@Component({
  selector: "app-edit-revista",
  templateUrl: "../add-revista/add-revista.component.html",
  styleUrl: "../add-revista/add-revista.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class EditRevistaComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private refService = inject(RefService);

  revista: JournalItem = { id: 0, name: "" };
  public revistaForm: FormGroup;
  button_text = "Actualizar revista";
  edit = true;
  notCanDo = false;

  constructor() {
    this.revistaForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit(): void {
    const data = this.route.snapshot.data;
    const journal = data["journal"] as JournalItem;
    this.revista = { id: journal.id, name: journal.name };
    this.notCanDo = (data["dependencies"] as RefDependenciesResponse).canDelete;
  }

  isDirty(): boolean {
    return this.revistaForm.dirty;
  }

  submitRevista(): void {
    if (!this.revistaForm.valid) return;
    this.refService.updateJournal(this.revista.id, { name: this.revista.name }).subscribe((result) => {
      if (result.status === 1) {
        this.revistaForm.markAsPristine();
        this.return();
        this.openSnackBar("Revista actualizada exitosamente");
      }
    });
  }

  return(): void {
    this.router.navigate(["dashboard/articulos"]);
  }

  private dialogRef2?: MatDialogRef<DialogErase3>;

  openEraser(): void {
    if (this.notCanDo) {
      this.dialogRef2 = this.dialog.open(DialogErase3, {
        width: "530px",
        id: "idleTimer",
        data: {
          title: "Eliminar revista",
          text: "¿Estás seguro que deseas eliminar esta revista?",
          cancel: "Sí, eliminar",
          yes: "No, cancelar",
        },
      });
      this.dialogRef2.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.eraseRevista();
        }
      });
    }
  }

  openSnackBar(value: string): void {
    this.snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  eraseRevista(): void {
    this.refService.deleteJournal(this.revista.id).subscribe((result) => {
      if (result.status === 1) {
        this.revistaForm.markAsPristine();
        this.return();
        this.openSnackBar("Revista eliminada exitosamente");
      } else {
        this.openSnackBar("Hubo un problema al eliminar");
      }
    });
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase3 {
  dialogRef = inject<MatDialogRef<DialogErase3>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
