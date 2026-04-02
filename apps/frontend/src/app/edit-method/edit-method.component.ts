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
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { ClassicEditor } from "ckeditor5";

import { DialogData } from "../models/dialogdata";
import { Languages } from "../models/languages";
import { Method } from "../models/method";
import { CommonService } from "../services/common.service";
import { GLOBAL } from "../services/global";
import { MethodsService } from "../services/methods.service";
import { SpaceValidator } from "../services/spacevalidator";

@Component({
  selector: "app-edit-method",
  templateUrl: "../add-method/add-method.component.html",
  styleUrls: ["../add-method/add-method.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgIf, CKEditorModule, NgClass],
})
export class EditMethodComponent implements OnInit {
  public Editor = ClassicEditor;
  button_text = "Actualizar información";
  metodo: Method;
  public methodForm: FormGroup;
  url;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _methodService: MethodsService,
  ) {
    this.methodForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcion: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcionEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.metodo = new Method(null, "", "", "", "", "", 1);
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    this.getMethod();
  }

  getMethod() {
    this._route.params.forEach((params: Params) => {
      let idMethod = params["id"];
      this._methodService.getMethod(idMethod).subscribe((result) => {
        if (result.length > 0) {
          this.metodo = result[0];
          localStorage.setItem("metodoEdit", JSON.stringify(this.metodo.nombre));
        }
      });
    });
  }

  submitMethod() {
    if (this.methodForm.valid) {
      this._methodService.updateMetodo(this.metodo).subscribe((result) => {
        if (result.status == 1) {
          if (this.fileData) {
            this._methodService.uploadMetodoFoto(this.fileData, this.metodo.idMetodo).subscribe((res) => {});
          }
          this.agregar = true;
          this.return();
          this.openSnackBar("Metódo actualizado exitosamente");
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

  edit = true;

  eraseMethod() {
    this._methodService.deleteMetodo(this.metodo.idMetodo).subscribe((res) => {
      if (res.status == 1) {
        this.agregar = true;
        this.return();
        this.openSnackBar("Metódo eliminado exitosamente");
      }
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

  private dialogRef2: MatDialogRef<DialogErase12>;

  openEraser() {
    this.dialogRef2 = this.dialog.open(DialogErase12, {
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
        this.eraseMethod();
      }
    });
  }

  private previewDialog: MatDialogRef<DialogPreview5>;

  previewMethod(value) {
    let method = JSON.parse(JSON.stringify(this.metodo));
    localStorage.setItem("langLocale", "0");
    method.foto = this.url + "metodo/get-image-metodo/" + method.foto;
    if (this.previewUrl) {
      method.foto = this.previewUrl;
    }
    if (value == 1) {
      method.nombre = method.nombreEN;
      method.descripcion = method.descripcionEN;
      localStorage.setItem("langLocale", "1");
    }
    this.previewDialog = this.dialog.open(DialogPreview5, {
      width: "871px",
      id: "previewMethod",
      data: method,
    });

    this.previewDialog.afterClosed().subscribe((result) => {
      if (!result) {
      }
    });
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../modals/dialog-options.html",
  imports: [MatDialogTitle, NgIf, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase12 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase12>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../modals/method-preview.html",
  styleUrls: ["../method/method.component.scss"],
  imports: [NgIf, MatDialogClose],
})
export class DialogPreview5 {
  url;
  language;
  constructor(
    public dialogRef: MatDialogRef<DialogPreview5>,
    @Inject(MAT_DIALOG_DATA) public method,
  ) {
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    if (localStorage.getItem("langLocale") == "0") {
      this.language = Languages[0];
    } else {
      this.language = Languages[1];
    }
    document.getElementById("descripcion").innerHTML = this.method.descripcion;
  }
}
