import { CdkScrollable } from "@angular/cdk/scrolling";
import { NgClass } from "@angular/common";
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
import { Languages } from "@app/shared/models/languages";
import type { Method } from "@app/shared/models/method";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { MethodsService } from "@app/shared/services/methods.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { ClassicEditor } from "ckeditor5";

@Component({
  selector: "app-edit-method",
  templateUrl: "../add-method/add-method.component.html",
  styleUrls: ["../add-method/add-method.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, CKEditorModule, NgClass],
})
export default class EditMethodComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _methodService = inject(MethodsService);

  public Editor = ClassicEditor;
  button_text = "Actualizar información";
  metodo: Method;
  public methodForm: FormGroup;
  url: string;

  constructor() {
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

  ngOnInit() {
    this.getMethod();
  }

  isDirty(): boolean {
    return this.methodForm.dirty;
  }

  getMethod(): void {
    this._route.params.forEach((params: Params) => {
      let idMethod = params["id"];
      this._methodService.getMethod(idMethod).subscribe((result: Method[]) => {
        if (result.length > 0) {
          this.metodo = result[0];
          localStorage.setItem("metodoEdit", JSON.stringify(this.metodo.nombre));
        }
      });
    });
  }

  submitMethod(): void {
    if (this.methodForm.valid) {
      this._methodService.updateMetodo(this.metodo).subscribe((result: any) => {
        if (result.status == 1) {
          if (this.fileData) {
            this._methodService.uploadMetodoFoto(this.fileData, this.metodo.idMetodo ?? 0).subscribe((_res: any) => {});
          }
          this.methodForm.markAsPristine();
          this.return();
          this.openSnackBar("Metódo actualizado exitosamente");
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

  edit = true;

  eraseMethod(): void {
    this._methodService.deleteMetodo(this.metodo.idMetodo ?? 0).subscribe((res: any) => {
      if (res.status == 1) {
        this.methodForm.markAsPristine();
        this.return();
        this.openSnackBar("Metódo eliminado exitosamente");
      }
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

  private dialogRef2?: MatDialogRef<DialogErase12>;

  openEraser(): void {
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
    this.dialogRef2.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.eraseMethod();
      }
    });
  }

  private previewDialog?: MatDialogRef<DialogPreview5>;

  previewMethod(value: number): void {
    const method: Method = JSON.parse(JSON.stringify(this.metodo));
    localStorage.setItem("langLocale", "0");
    method.foto = this.url + "metodo/get-image-metodo/" + method.foto;
    if (this.previewUrl) {
      method.foto = typeof this.previewUrl === "string" ? this.previewUrl : "";
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

    this.previewDialog.afterClosed().subscribe(() => {});
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase12 {
  dialogRef = inject<MatDialogRef<DialogErase12>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/method-preview.html",
  styleUrls: ["../../../public/about/method/method.component.scss"],
  imports: [MatDialogClose],
})
export class DialogPreview5 {
  dialogRef = inject<MatDialogRef<DialogPreview5>>(MatDialogRef);
  method = inject<Method>(MAT_DIALOG_DATA);

  url: string;
  language: (typeof Languages)[number] = Languages[0];
  constructor() {
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
