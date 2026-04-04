import { NgClass } from "@angular/common";
import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { Languages } from "@app/shared/models/languages";
import type { Method } from "@app/shared/models/method";
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
  imports: [MatIcon, FormsModule, ReactiveFormsModule, CKEditorModule, NgClass],
})
export default class AddMethodComponent implements OnInit, HasUnsavedChanges {
  public Editor = ClassicEditor;
  button_text = "Guardar método";
  metodo: Method;
  public methodForm: FormGroup;
  url: string;

  openEraser() {}
  edit = false;

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
    this.metodo = {
      idMetodo: 0,
      nombre: "",
      nombreEN: "",
      descripcion: "",
      descripcionEN: "",
      foto: "",
      grupo_idGrupo: 1,
    };
    this.url = GLOBAL.url;
  }

  ngOnInit() {}

  isDirty(): boolean {
    return this.methodForm.dirty;
  }

  submitMethod(): void {
    if (this.methodForm.valid) {
      this._methodService.addMetodo(this.metodo).subscribe((result: any) => {
        if (result.status == 1) {
          if (this.fileData) {
            this._methodService.uploadMetodoFoto(this.fileData, result.idMetodo).subscribe((_res: any) => {});
          }
          this.methodForm.markAsPristine();
          this.return();
          this.openSnackBar();
        }
      });
    }
  }

  return(): void {
    this._router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar(): void {
    this._snackBar.open("Método agregado exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  fileData: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  fileUploadProgress: string | null = null;
  uploadedFilePath: string | null = null;
  fileProgress(fileInput: Event): void {
    const target = fileInput.target as HTMLInputElement | null;
    this.fileData = target?.files?.[0] ?? null;
    if (!this.fileData) return;
    this.preview();
  }

  preview(): void {
    if (!this.fileData) return;
    // Show preview
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.addEventListener("load", (_event) => {
      this.previewUrl = reader.result;
    });
  }

  private previewDialog?: MatDialogRef<DialogPreview4>;

  previewMethod(value: number): void {
    const method: Method = JSON.parse(JSON.stringify(this.metodo));
    localStorage.setItem("langLocale", "0");
    method.foto = typeof this.previewUrl === "string" ? this.previewUrl : "";
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

    this.previewDialog.afterClosed().subscribe(() => {});
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/method-preview.html",
  styleUrls: ["../../../public/about/method/method.component.scss"],
  imports: [MatDialogClose],
})
export class DialogPreview4 {
  url: string;
  language: (typeof Languages)[number] = Languages[0];
  constructor(
    public dialogRef: MatDialogRef<DialogPreview4>,
    @Inject(MAT_DIALOG_DATA) public method: Method,
  ) {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    if (localStorage.getItem("langLocale") == "0") {
      this.language = Languages[0];
    } else {
      this.language = Languages[1];
    }
    const descripcion = document.getElementById("descripcion");
    if (descripcion) {
      descripcion.innerHTML = this.method.descripcion ?? "";
    }
  }
}
