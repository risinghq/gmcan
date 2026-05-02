import { Component, OnInit, inject } from "@angular/core";
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
  styleUrl: "./add-method.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule, CKEditorModule],
})
export default class AddMethodComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  route = inject(ActivatedRoute);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private methodService = inject(MethodsService);

  public Editor = ClassicEditor;
  button_text = "Guardar método";
  metodo: Method;
  public methodForm: FormGroup;
  url: string;

  openEraser() {}
  edit = false;

  constructor() {
    this.methodForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcion: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcionEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.metodo = {
      id: 0,
      name: "",
      nameEN: "",
      description: "",
      descriptionEN: null,
      photo: null,
      groupId: 1,
      createdAt: null,
      updatedAt: null,
    };
    this.url = GLOBAL.url;
  }

  ngOnInit() {}

  isDirty(): boolean {
    return this.methodForm.dirty;
  }

  submitMethod(): void {
    if (this.methodForm.valid) {
      this.methodService
        .create({
          name: this.metodo.name,
          nameEN: this.metodo.nameEN,
          description: this.metodo.description,
          descriptionEN: this.metodo.descriptionEN ?? undefined,
          groupId: this.metodo.groupId,
        })
        .subscribe((result) => {
          if (result.id) {
            if (this.fileData) {
              this.methodService.uploadPhoto(result.id, this.fileData).subscribe();
            }
            this.methodForm.markAsPristine();
            this.return();
            this.openSnackBar();
          }
        });
    }
  }

  return(): void {
    this.router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar(): void {
    this.snackBar.open("Método agregado exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
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

  private previewDialog?: MatDialogRef<DialogPreview4>;

  previewMethod(value: number): void {
    const method: Method = JSON.parse(JSON.stringify(this.metodo));
    localStorage.setItem("langLocale", "0");
    method.photo = typeof this.previewUrl === "string" ? this.previewUrl : null;
    if (value == 1) {
      method.name = method.nameEN;
      method.description = method.descriptionEN ?? method.description;
      localStorage.setItem("langLocale", "1");
    }
    this.previewDialog = this.dialog.open(DialogPreview4, {
      width: "871px",
      id: "previewMethod",
      data: method,
    });

    this.previewDialog.afterClosed().subscribe();
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/method-preview.html",
  styleUrl: "../../../public/about/method/component.scss",
  imports: [MatDialogClose],
})
export class DialogPreview4 {
  dialogRef = inject<MatDialogRef<DialogPreview4>>(MatDialogRef);
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
      descripcion.innerHTML = this.method.description ?? "";
    }
  }
}
