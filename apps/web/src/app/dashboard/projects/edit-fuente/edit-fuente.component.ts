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
import { LookupService } from "@app/shared/services/lookup.service";
import { ProjectService } from "@app/shared/services/project.service";
import type { FundingSourceItem } from "@app/shared/services/ref.service";
import { RefService } from "@app/shared/services/ref.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

@Component({
  selector: "app-edit-fuente",
  templateUrl: "../add-fuente/add-fuente.component.html",
  styleUrl: "../add-fuente/add-fuente.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class EditFuenteComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private refService = inject(RefService);
  private projectService = inject(ProjectService);
  private lookup = inject(LookupService);

  fuente: FundingSourceItem = { id: 0, name: "" };
  public fuenteForm: FormGroup;
  button_text = "Actualizar información";
  edit = true;

  constructor() {
    this.fuenteForm = this.formBuilder.group({
      name: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit(): void {
    this.getFuente();
  }

  isDirty(): boolean {
    return this.fuenteForm.dirty;
  }

  getFuente(): void {
    const idFuente = Number(this.route.snapshot.params["id"] ?? 0);
    this.refService.getFundingSource(idFuente).subscribe((result) => {
      if (result) {
        this.fuente = result;
        this.checkCanDelete(result.id);
      }
    });
  }

  notCanDo = false;

  checkCanDelete(fundingSourceId: number): void {
    void fundingSourceId;
    this.projectService.listAdminProjects().subscribe((projects) => {
      const sourceName = this.fuente.name.trim().toLowerCase();
      const matched = this.lookup.fundingSources().find((item) => item.name.trim().toLowerCase() === sourceName);
      const inUse = matched ? projects.some((p) => p.fundingSourceCode === matched.code) : false;
      this.notCanDo = !inUse;
    });
  }

  submitFuente(): void {
    if (this.fuenteForm.valid) {
      this.refService.updateFundingSource(this.fuente.id, { name: this.fuente.name }).subscribe((result) => {
        if (result.status === 1) {
          this.fuenteForm.markAsPristine();
          this.return();
          this.openSnackBar("Fuente de financiamiento actualizada exitosamente");
        }
      });
    }
  }

  return(): void {
    this.router.navigate(["dashboard/proyectos-ejecucion"]);
  }

  openSnackBar(value: string): void {
    this.snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  private dialogRef2?: MatDialogRef<DialogErase9>;

  openEraser(): void {
    if (this.notCanDo) {
      this.dialogRef2 = this.dialog.open(DialogErase9, {
        width: "530px",
        id: "idleTimer",
        data: {
          title: "Eliminar fuente de financiamiento",
          text: "¿Estás seguro que deseas eliminar esta fuente?",
          cancel: "Sí, eliminar",
          yes: "No, cancelar",
        },
      });
      this.dialogRef2.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.eraseFuente();
        }
      });
    }
  }

  eraseFuente(): void {
    if (this.notCanDo) {
      this.refService.deleteFundingSource(this.fuente.id).subscribe((result) => {
        if (result.status === 1) {
          this.fuenteForm.markAsPristine();
          this.return();
          this.openSnackBar("Fuente de financiamiento eliminada exitosamente");
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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase9 {
  dialogRef = inject<MatDialogRef<DialogErase9>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
