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
import type { Equipment } from "@app/shared/models/equipment";
import { createEquipment } from "@app/shared/models/factories";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GroupService } from "@app/shared/services/group.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

@Component({
  selector: "app-edit-equipo",
  templateUrl: "../add-equipo/add-equipo.component.html",
  styleUrl: "../add-equipo/add-equipo.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class EditEquipoComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private groupService = inject(GroupService);

  edit = true;
  equipo: Equipment;
  equipoForm: FormGroup;
  button_text = "Actualizar información";

  constructor() {
    this.equipo = createEquipment();
    this.equipoForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      cpu: [""],
      gpu: [""],
      ram: [""],
      hd: [""],
    });
  }

  ngOnInit() {
    this.getEquipo();
  }

  isDirty(): boolean {
    return this.equipoForm.dirty;
  }

  getEquipo(): void {
    const idEquipo = Number(this.route.snapshot.params["id"] ?? 0);
    this.groupService.getEquipment(idEquipo).subscribe((eq: Equipment) => {
      if (eq) {
        this.equipo = eq;
      }
    });
  }

  submitEquipo(): void {
    if (this.equipoForm.valid) {
      this.groupService
        .updateEquipment(this.equipo.id, {
          name: this.equipo.name,
          cpu: this.equipo.cpu ?? undefined,
          gpu: this.equipo.gpu ?? undefined,
          ram: this.equipo.ram ?? undefined,
          storage: this.equipo.storage ?? undefined,
        })
        .subscribe((res) => {
          if (res.status === 1) {
            this.equipoForm.markAsPristine();
            this.return();
            this.openSnackBar("Equipo actualizado exitosamente");
          }
        });
    }
  }

  return(): void {
    this.router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar(value: string): void {
    this.snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  private dialogRef2?: MatDialogRef<DialogErase13>;

  openEraser(): void {
    this.dialogRef2 = this.dialog.open(DialogErase13, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "Eliminar equipo",
        text: "¿Estás seguro que deseas eliminar este equipo?",
        cancel: "Sí, eliminar",
        yes: "No, cancelar",
      },
    });
    this.dialogRef2.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.eraseEquipo();
      }
    });
  }

  eraseEquipo(): void {
    this.groupService.deleteEquipment(this.equipo.id).subscribe((result) => {
      if (result.status === 1) {
        this.equipoForm.markAsPristine();
        this.return();
        this.openSnackBar("Equipo eliminado exitosamente");
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
export class DialogErase13 {
  dialogRef = inject<MatDialogRef<DialogErase13>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
