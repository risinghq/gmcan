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
import { AutosizeModule } from "ngx-autosize";

import { DialogData } from "../models/dialogdata";
import { Software } from "../models/software";
import { CommonService } from "../services/common.service";
import { SoftwareService } from "../services/software.service";
import { SpaceValidator } from "../services/spacevalidator";

@Component({
  selector: "app-edit-software",
  templateUrl: "../add-software/add-software.component.html",
  styleUrls: ["../add-software/add-software.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, AutosizeModule, NgIf, NgClass],
})
export class EditSoftwareComponent implements OnInit {
  edit = true;
  software: Software;
  softwareForm: FormGroup;
  button_text = "Actualizar información";

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _softwareService: SoftwareService,
  ) {
    this.software = new Software(null, "", "", "", "", 1, null, null);
    this.softwareForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcion: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcionEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      moreInfo: [""],
    });
  }

  ngOnInit() {
    this.getSoftware();
  }

  getSoftware() {
    this._route.params.forEach((params: Params) => {
      let idSoftware = params["id"];
      this._softwareService.getSoftwareId(idSoftware).subscribe((result) => {
        if (result.length > 0) {
          this.software = result[0];
          localStorage.setItem("softwareEdit", JSON.stringify(this.software.nombre));
        }
      });
    });
  }

  submitSoftware() {
    this._softwareService.updateSoftware(this.software).subscribe((res) => {
      if (res.status == 1) {
        this.agregar = true;
        this.return();
        this.openSnackBar("Software actualizado exitosamente");
      }
    });
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

  private dialogRef2: MatDialogRef<DialogErase14>;

  openEraser() {
    this.dialogRef2 = this.dialog.open(DialogErase14, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "Eliminar software",
        text: "¿Estás seguro que deseas eliminar este software?",
        cancel: "Sí, eliminar",
        yes: "No, cancelar",
      },
    });
    this.dialogRef2.afterClosed().subscribe((result) => {
      if (result) {
        this.eraseSoftware();
      }
    });
  }

  eraseSoftware() {
    this._softwareService.deleteSoftware(this.software.idSoftware).subscribe((result) => {
      if (result.status == 1) {
        this.agregar = true;
        this.return();
        this.openSnackBar("Software eliminado exitosamente");
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
export class DialogErase14 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase14>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
