import { CdkScrollable } from "@angular/cdk/scrolling";
import { NgClass } from "@angular/common";
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
import { DialogData } from "@app/shared/models/dialogdata";
import type { Software } from "@app/shared/models/software";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { SoftwareService } from "@app/shared/services/software.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-edit-software",
  templateUrl: "../add-software/add-software.component.html",
  styleUrls: ["../add-software/add-software.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, AutosizeModule, NgClass],
})
export default class EditSoftwareComponent implements OnInit, HasUnsavedChanges {
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
    private _softwareService: SoftwareService,
  ) {
    this.software = { idSoftware: 0, nombre: "", descripcion: "", descripcionEN: "", moreInfo: "", grupo_idGrupo: 1 };
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

  isDirty(): boolean {
    return this.softwareForm.dirty;
  }

  getSoftware(): void {
    this._route.params.forEach((params: Params) => {
      let idSoftware = params["id"];
      this._softwareService.getSoftwareId(idSoftware).subscribe((result: Software[]) => {
        if (result.length > 0) {
          this.software = result[0];
          localStorage.setItem("softwareEdit", JSON.stringify(this.software.nombre));
        }
      });
    });
  }

  submitSoftware(): void {
    this._softwareService.updateSoftware(this.software).subscribe((res: any) => {
      if (res.status == 1) {
        this.softwareForm.markAsPristine();
        this.return();
        this.openSnackBar("Software actualizado exitosamente");
      }
    });
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

  private dialogRef2?: MatDialogRef<DialogErase14>;

  openEraser(): void {
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
    this.dialogRef2.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.eraseSoftware();
      }
    });
  }

  eraseSoftware(): void {
    this._softwareService.deleteSoftware(this.software.idSoftware ?? 0).subscribe((result: any) => {
      if (result.status == 1) {
        this.softwareForm.markAsPristine();
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
  templateUrl: "../../../shared/modals/dialog-options.html",
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase14 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase14>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
