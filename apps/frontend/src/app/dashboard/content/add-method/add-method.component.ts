import { NgIf, NgClass } from "@angular/common";
import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { Languages } from "@app/shared/models/languages";
import { Method } from "@app/shared/models/method";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { MethodsService } from "@app/shared/services/methods.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { ClassicEditor } from "ckeditor5";

@Component({
  selector: "app-add-method",
  templateUrl: "./add-method.component.html",
  styleUrls: ["./add-method.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgIf, CKEditorModule, NgClass],
})
export default class AddMethodComponent implements OnInit, HasUnsavedChanges {
  public Editor = ClassicEditor;
  button_text = "Guardar método";
  metodo: Method;
  public methodForm: FormGroup;
  url;

  openEraser() {}
  edit;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
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

  ngOnInit() {}

  isDirty(): boolean {
    return this.methodForm.dirty;
  }

  submitMethod() {
    if (this.methodForm.valid) {
      this._methodService.addMetodo(this.metodo).subscribe((result) => {
        if (result.status == 1) {
          if (this.fileData) {
            this._methodService.uploadMetodoFoto(this.fileData, result.idMetodo).subscribe((res) => {});
          }
          this.methodForm.markAsPristine();
          this.return();
          this.openSnackBar();
        }
      });
    }
  }

  return() {
    this._router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar() {
    this._snackBar.open("Método agregado exitosamente", null, {
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

  private previewDialog: MatDialogRef<DialogPreview4>;

  previewMethod(value) {
    let method = JSON.parse(JSON.stringify(this.metodo));
    localStorage.setItem("langLocale", "0");
    method.foto = this.previewUrl;
    if (value == 1) {
      method.nombre = method.nombreEN;
      method.descripcion = method.descripcionEN;
      localStorage.setItem("langLocale", "1");
    }
    this.previewDialog = this.dialog.open(DialogPreview4, {
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
  templateUrl: "../../../shared/modals/method-preview.html",
  styleUrls: ["../../../public/about/method/method.component.scss"],
  imports: [NgIf, MatDialogClose],
})
export class DialogPreview4 {
  url;
  language;
  constructor(
    public dialogRef: MatDialogRef<DialogPreview4>,
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
