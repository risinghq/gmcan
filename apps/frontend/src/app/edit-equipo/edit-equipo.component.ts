import { CdkScrollable } from "@angular/cdk/scrolling";
import { NgIf, NgClass } from "@angular/common";
import { Component, OnInit, Inject } from "@angular/core";
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
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { DialogData } from "../models/dialogdata";
import { Equipo } from "../models/equipo";
import { CommonService } from "../services/common.service";
import { EquipoService } from "../services/equipo.service";
import { SpaceValidator } from "../services/spacevalidator";

@Component({
  selector: "app-edit-equipo",
  templateUrl: "../add-equipo/add-equipo.component.html",
  styleUrls: ["../add-equipo/add-equipo.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgIf, NgClass],
})
export class EditEquipoComponent implements OnInit {
  edit = true;
  equipo: Equipo;
  equipoForm: FormGroup;
  button_text = "Actualizar información";

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _equipoService: EquipoService,
  ) {
    this.equipo = new Equipo(null, "", "", "", "", "", 1, null, null);
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

  getEvento() {
    this._route.params.forEach((params: Params) => {
      let idEquipo = params["id"];
      this._equipoService.getEquipo(idEquipo).subscribe((result) => {
        if (result.length > 0) {
          this.equipo = result[0];
          localStorage.setItem("equipoEdit", JSON.stringify(this.equipo.nombre));
        }
      });
    });
  }

  submitEquipo() {
    if (this.equipoForm.valid) {
      this._equipoService.updateEquipo(this.equipo).subscribe((res) => {
        if (res.status == 1) {
          this.agregar = true;
          this.return();
          this.openSnackBar("Equipo actualizado exitosamente");
        }
      });
    }
  }

  agregar;

  return() {
    this._commonService.setEndSession("0");
    this._router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar(value) {
    this._snackBar.open(value, null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  private dialogRef2: MatDialogRef<DialogErase13>;

  openEraser() {
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
    this.dialogRef2.afterClosed().subscribe((result) => {
      if (result) {
        this.eraseEquipo();
      }
    });
  }

  eraseEquipo() {
    this._equipoService.deleteEquipo(this.equipo.idEquipo).subscribe((result) => {
      if (result.status == 1) {
        this.agregar = true;
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
  templateUrl: "../modals/dialog-options.html",
  imports: [MatDialogTitle, NgIf, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase13 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase13>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
