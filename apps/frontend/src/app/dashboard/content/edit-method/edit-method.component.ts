import { CdkScrollable } from "@angular/cdk/scrolling";
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
import { ActivatedRoute, Router } from "@angular/router";
import { DialogData } from "@app/shared/models/dialogdata";
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
  styleUrl: "../add-method/add-method.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule, CKEditorModule],
})
export default class EditMethodComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private methodService = inject(MethodsService);

  public Editor = ClassicEditor;
  button_text = "Actualizar información";
  metodo: Method;
  public methodForm: FormGroup;
  url: string;

  constructor() {
    this.methodForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcion: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.metodo = {
      id: 0,
      name: "",
      description: "",
      asset: null,
      groupId: 1,
      createdAt: null,
      updatedAt: null,
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
    const idMethod = Number(this.route.snapshot.params["id"]);
    this.methodService.get(idMethod).subscribe((result: Method) => {
      if (result) {
        this.metodo = result;
      }
    });
  }

  submitMethod(): void {
    if (this.methodForm.valid) {
      this.methodService
        .update(this.metodo.id, {
          name: this.metodo.name,
          description: this.metodo.description,
        })
        .subscribe((result) => {
          if (result.status === 1) {
            if (this.fileData) {
              this.methodService.uploadAsset(this.metodo.id, this.fileData).subscribe();
            }
            this.methodForm.markAsPristine();
            this.return();
            this.openSnackBar("Metódo actualizado exitosamente");
          }
        });
    }
  }

  return(): void {
    this.router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar(value: string): void {
    this.snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  edit = true;

  eraseMethod(): void {
    this.methodService.delete(this.metodo.id).subscribe((res) => {
      if (res.status === 1) {
        this.methodForm.markAsPristine();
        this.return();
        this.openSnackBar("Metódo eliminado exitosamente");
      }
    });
  }

  fileData: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  fileProgress(fileInput: Event): void {
    const target = fileInput.target as HTMLInputElement | null;
    this.fileData = target?.files?.[0] ?? null;
    if (!this.fileData) return;
    this.preview();
  }

  preview(): void {
    if (!this.fileData) return;
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
        title: "Eliminar método",
        text: "¿Estás seguro que deseas eliminar este método?",
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

  previewMethod(): void {
    const method: Method = JSON.parse(JSON.stringify(this.metodo));
    method.asset = this.url + "admin/methods/" + this.metodo.id + "/asset";
    if (this.previewUrl) {
      method.asset = typeof this.previewUrl === "string" ? this.previewUrl : null;
    }
    this.previewDialog = this.dialog.open(DialogPreview5, {
      width: "871px",
      id: "previewMethod",
      data: { method },
    });

    this.previewDialog.afterClosed().subscribe();
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
  styleUrl: "../../../public/about/method/component.scss",
  imports: [MatDialogClose],
})
export class DialogPreview5 {
  dialogRef = inject<MatDialogRef<DialogPreview5>>(MatDialogRef);
  data = inject<{ method: Method }>(MAT_DIALOG_DATA);
  method = this.data.method;

  url: string;
  constructor() {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    const descripcion = document.getElementById("descripcion");
    if (descripcion) {
      descripcion.innerHTML = this.method.description ?? "";
    }
  }
}
