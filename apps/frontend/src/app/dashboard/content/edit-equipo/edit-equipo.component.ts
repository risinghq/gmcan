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
import { ActivatedRoute, Router, Params } from "@angular/router";
import { DialogData } from "@app/shared/models/dialogdata";
import type { Equipo } from "@app/shared/models/equipo";
import { createEquipo } from "@app/shared/models/factories";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { EquipoService } from "@app/shared/services/equipo.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

@Component({
  selector: "app-edit-equipo",
  templateUrl: "../add-equipo/add-equipo.component.html",
  styleUrls: ["../add-equipo/add-equipo.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class EditEquipoComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _equipoService = inject(EquipoService);

  edit = true;
  equipo: Equipo;
  equipoForm: FormGroup;
  button_text = "Actualizar información";

  constructor() {
    this.equipo = createEquipo();
    this.equipoForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      cpu: [""],
      gpu: [""],
      ram: [""],
      hd: [""],
    });
  }

  ngOnInit() {
    this.getEvento();
  }

  isDirty(): boolean {
    return this.equipoForm.dirty;
  }

  getEvento(): void {
    this._route.params.forEach((params: Params) => {
      let idEquipo = params["id"];
      this._equipoService.getEquipo(idEquipo).subscribe((result: Equipo[]) => {
        if (result.length > 0) {
          this.equipo = result[0];
          localStorage.setItem("equipoEdit", JSON.stringify(this.equipo.nombre));
        }
      });
    });
  }

  submitEquipo(): void {
    if (this.equipoForm.valid) {
      this._equipoService.updateEquipo(this.equipo).subscribe((res: any) => {
        if (res.status == 1) {
          this.equipoForm.markAsPristine();
          this.return();
          this.openSnackBar("Equipo actualizado exitosamente");
        }
      });
    }
  }

  return(): void {
    this._router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar(value: string): void {
    this._snackBar.open(value, undefined, {
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
    this._equipoService.deleteEquipo(this.equipo.idEquipo ?? 0).subscribe((result: any) => {
      if (result.status == 1) {
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
