import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { DialogData } from "../models/dialogdata";
import { lineasInvestigacion } from "../models/lineaInvestigacion";
import { CommonService } from "../services/common.service";
import { GLOBAL } from "../services/global";
import { LineasInvestigacionService } from "../services/lineasinvestigacion.service";
import { SpaceValidator } from "../services/spacevalidator";

@Component({
  standalone: false,
  selector: "app-add-linea",
  templateUrl: "./add-linea.component.html",
  styleUrls: ["./add-linea.component.scss"],
})
export class AddLineaComponent implements OnInit {
  button_text = "Guardar línea";
  lineaInvestigacion: lineasInvestigacion;
  public lineaForm: FormGroup;
  url;

  notCanDo;
  openEraser() {}
  edit;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _lineaInvestigacionService: LineasInvestigacionService,
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

  ngOnInit() {}

  submitLinea() {
    this._lineaInvestigacionService.addLinea(this.lineaInvestigacion).subscribe((result) => {
      if (result.status == 1) {
        if (this.fileData) {
          this._lineaInvestigacionService
            .uploadLineaFoto(this.fileData, result.idLineasInvestigacion)
            .subscribe((res) => {});
        }
        this.agregar = true;
        this.return();
        this.openSnackBar();
      }
    });
  }

  agregar;

  return() {
    this._commonService.setEndSession("0");
    this._router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar() {
    this._snackBar.open("Línea de investigación agregada exitosamente", null, {
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

  private dialogRef: MatDialogRef<DialogCancel22>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel22, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "¿Estás seguro que deseas volver sin guardar?",
        text: "La información no se guardará",
        cancel: "Sí, volver",
        yes: "No, mantenerme aquí",
      },
    });
  }

  canDeactivate(): Observable<boolean> {
    if (!this.agregar) {
      this.openDialog();
      return this.dialogRef.afterClosed().pipe(
        map((result) => {
          return result === true;
        }),
      );
    } else {
      return;
    }
  }
}

@Component({
  standalone: false,
  selector: "dialog-content-example-dialog",
  templateUrl: "../modals/dialog-options.html",
})
export class DialogCancel22 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel22>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
