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
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { DialogData } from "../models/dialogdata";
import { lineasInvestigacion } from "../models/lineaInvestigacion";
import { CommonService } from "../services/common.service";
import { GLOBAL } from "../services/global";
import { LineasInvestigacionService } from "../services/lineasinvestigacion.service";
import { ProyectoService } from "../services/proyecto.service";
import { SpaceValidator } from "../services/spacevalidator";

@Component({
  selector: "app-edit-linea",
  templateUrl: "../add-linea/add-linea.component.html",
  styleUrls: ["../add-linea/add-linea.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgIf, AutosizeModule, NgClass],
})
export class EditLineaComponent implements OnInit {
  button_text = "Actualizar información";
  lineaInvestigacion: lineasInvestigacion;
  public lineaForm: FormGroup;
  url;
  edit = true;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _lineaInvestigacionService: LineasInvestigacionService,
    private _proyectoService: ProyectoService,
  ) {
    this.lineaForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcion: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcionEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.lineaInvestigacion = new lineasInvestigacion(null, "", "", null, "", "", 1, null, null, null, null);
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    this.getLinea();
  }

  getLinea() {
    this._route.params.forEach((params: Params) => {
      let idLineaInvestigacion = params["id"];
      this._lineaInvestigacionService.getLineaInvestigacion(idLineaInvestigacion).subscribe((result) => {
        if (result.length > 0) {
          this.lineaInvestigacion = result[0];
          localStorage.setItem("lineaInvestigacionEdit", JSON.stringify(this.lineaInvestigacion.nombre));
          this._proyectoService.getProyectosLinea(idLineaInvestigacion, 1).subscribe((result) => {
            if (result == 0) {
              this.notCanDo = true;
            } else {
              this.notCanDo = false;
            }
          });
          this._proyectoService.getProyectosLinea(idLineaInvestigacion, 0).subscribe((result) => {
            if (result == 0) {
              this.notCanDo = true;
            } else {
              this.notCanDo = false;
            }
          });
        }
      });
    });
  }

  submitLinea() {
    this._lineaInvestigacionService.updateLinea(this.lineaInvestigacion).subscribe((result) => {
      if (result.status == 1) {
        if (this.fileData) {
          this._lineaInvestigacionService
            .uploadLineaFoto(this.fileData, this.lineaInvestigacion.idLineasInvestigacion)
            .subscribe((res) => {});
        }
        this.agregar = true;
        this.return();
        this.openSnackBar("Linea de investigación actualizada exitosamente");
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

  fileData: File = null;
  previewUrl: any = null;
  fileUploadProgress: string = null;
  uploadedFilePath: string = null;
  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];
    this.preview();
  }

  preview() {
    // Show preview
    var mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    var reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = (_event) => {
      this.previewUrl = reader.result;
    };
  }

  notCanDo;

  eraseLinea() {
    if (this.notCanDo) {
      this._lineaInvestigacionService.deleteLinea(this.lineaInvestigacion.idLineasInvestigacion).subscribe((result) => {
        if (result.status == 1) {
          this.agregar = true;
          this.return();
          this.openSnackBar("Evento eliminado exitosamente");
        } else {
          this.openSnackBar("Hubo un problema al eliminar");
        }
      });
    }
  }

  private dialogRef2: MatDialogRef<DialogErase11>;

  openEraser() {
    if (this.notCanDo) {
      this.dialogRef2 = this.dialog.open(DialogErase11, {
        width: "530px",
        id: "idleTimer",
        data: {
          title: "Eliminar línea de investigación",
          text: "¿Estás seguro que deseas eliminar esta línea?",
          cancel: "Sí, eliminar",
          yes: "No, cancelar",
        },
      });
      this.dialogRef2.afterClosed().subscribe((result) => {
        if (result) {
          this.eraseLinea();
        }
      });
    }
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../modals/dialog-options.html",
  imports: [MatDialogTitle, NgIf, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase11 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase11>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
