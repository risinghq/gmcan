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
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogData } from "@app/shared/models/dialogdata";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import type { JournalItem } from "@app/shared/services/ref.service";
import { RefService } from "@app/shared/services/ref.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

@Component({
  selector: "app-edit-revista",
  templateUrl: "../add-revista/add-revista.component.html",
  styleUrl: "../add-revista/add-revista.component.scss",
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
    this.getRevista();
  }

  isDirty(): boolean {
    return this.revistaForm.dirty;
  }

  getRevista(): void {
    const id = Number(this.route.snapshot.params["id"] ?? 0);
    this.refService.listJournals().subscribe((journals) => {
      const found = journals.find((r) => r.id === id);
      if (!found) return;
      this.revista = { id: found.id, name: found.name };
      this.checkCanDelete(id);
    });
  }

  checkCanDelete(id: number): void {
    this.refService.getJournalDependencies(id).subscribe((res) => {
      this.notCanDo = res.canDelete;
    });
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
