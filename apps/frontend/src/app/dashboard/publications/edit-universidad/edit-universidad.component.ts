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
import { LookupService } from "@app/shared/services/lookup.service";
import { PublicationService } from "@app/shared/services/publication.service";
import type { UniversityItem } from "@app/shared/services/ref.service";
import { RefService } from "@app/shared/services/ref.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

@Component({
  selector: "app-edit-universidad",
  templateUrl: "../add-universidad/add-universidad.component.html",
  styleUrl: "../add-universidad/add-universidad.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class EditUniversidadComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private refService = inject(RefService);
  private lookup = inject(LookupService);
  private publicationService = inject(PublicationService);

  universidad: UniversityItem = { id: 0, name: "", nameEN: "" };
  public universidadForm: FormGroup;
  button_text = "Actualizar universidad";
  edit = true;
  notCanDo = false;

  constructor() {
    this.universidadForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  isDirty(): boolean {
    return this.universidadForm.dirty;
  }

  ngOnInit(): void {
    this.getUniversidad();
  }

  getUniversidad(): void {
    const id = Number(this.route.snapshot.params["id"] ?? 0);
    const found = this.lookup.universities().find((u) => u.id === id);
    if (found) {
      this.universidad = { id: found.id, name: found.name, nameEN: found.nameEN };
      this.checkCanDelete(id);
    }
  }

  checkCanDelete(id: number): void {
    this.publicationService.listAdminPublications().subscribe((pubs) => {
      this.notCanDo = pubs.filter((p) => p.universityId === id).length === 0;
    });
  }

  submitUniversidad(): void {
    if (!this.universidadForm.valid) return;
    this.refService
      .updateUniversity(this.universidad.id, {
        name: this.universidad.name,
        nameEN: this.universidad.nameEN,
      })
      .subscribe((result) => {
        if (result.status === 1) {
          this.universidadForm.markAsPristine();
          this.return();
          this.openSnackBar("Universidad actualizada exitosamente");
        }
      });
  }

  return(): void {
    this.router.navigate(["dashboard/tesis"]);
  }

  openSnackBar(value: string): void {
    this.snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  private dialogRef2?: MatDialogRef<DialogErase4>;

  openEraser(): void {
    if (this.notCanDo) {
      this.dialogRef2 = this.dialog.open(DialogErase4, {
        width: "530px",
        id: "idleTimer",
        data: {
          title: "Eliminar universidad",
          text: "¿Estás seguro que deseas eliminar esta universidad?",
          cancel: "Sí, eliminar",
          yes: "No, cancelar",
        },
      });
      this.dialogRef2.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.eraseUniversidad();
        }
      });
    }
  }

  eraseUniversidad(): void {
    this.refService.deleteUniversity(this.universidad.id).subscribe((result) => {
      if (result.status === 1) {
        this.universidadForm.markAsPristine();
        this.return();
        this.openSnackBar("Universidad eliminada exitosamente");
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
export class DialogErase4 {
  dialogRef = inject<MatDialogRef<DialogErase4>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
