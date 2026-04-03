import { NgIf, NgClass } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { AutosizeModule } from "ngx-autosize";

import { lineasInvestigacion } from "../models/lineaInvestigacion";
import { HasUnsavedChanges } from "../models/unsaved-changes";
import { GLOBAL } from "../services/global";
import { LineasInvestigacionService } from "../services/lineasinvestigacion.service";
import { SpaceValidator } from "../services/spacevalidator";

@Component({
  selector: "app-add-linea",
  templateUrl: "./add-linea.component.html",
  styleUrls: ["./add-linea.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgIf, AutosizeModule, NgClass],
})
export class AddLineaComponent implements OnInit, HasUnsavedChanges {
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

  isDirty(): boolean {
    return this.lineaForm.dirty;
  }

  submitLinea() {
    this._lineaInvestigacionService.addLinea(this.lineaInvestigacion).subscribe((result) => {
      if (result.status == 1) {
        if (this.fileData) {
          this._lineaInvestigacionService
            .uploadLineaFoto(this.fileData, result.idLineasInvestigacion)
            .subscribe((res) => {});
        }
        this.lineaForm.markAsPristine();
        this.return();
        this.openSnackBar();
      }
    });
  }

  return() {
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
}
