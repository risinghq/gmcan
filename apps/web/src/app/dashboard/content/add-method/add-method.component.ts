import { Component, OnInit, inject, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { RichTextEditorComponent } from "@app/shared/components/rich-text-editor/rich-text-editor.component";
import type { Method } from "@app/shared/models/method";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { MethodsService } from "@app/shared/services/methods.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

@Component({
  selector: "app-add-method",
  templateUrl: "./add-method.component.html",
  styleUrl: "./add-method.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon, FormsModule, ReactiveFormsModule, RichTextEditorComponent],
})
export default class AddMethodComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  route = inject(ActivatedRoute);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private methodService = inject(MethodsService);

  button_text = "Guardar método";
  metodo: Method;
  public methodForm: FormGroup;
  url: string;

  openEraser() {}
  edit = false;

  constructor() {
    this.methodForm = this.formBuilder.group({
      name: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      description: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
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

  ngOnInit() {}

  isDirty(): boolean {
    return this.methodForm.dirty;
  }

  submitMethod(): void {
    if (this.methodForm.valid) {
      this.metodo.description = this.methodForm.controls["description"].value ?? "";
      this.methodService
        .create({
          name: this.metodo.name,
          description: this.metodo.description,
          groupId: this.metodo.groupId,
        })
        .subscribe((result) => {
          if (result.id) {
            if (this.fileData) {
              this.methodService.uploadAsset(result.id, this.fileData).subscribe();
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

  previewMethod(): void {
    const method: Method = JSON.parse(JSON.stringify(this.metodo));
    method.description = this.methodForm.controls["description"].value ?? "";
    method.asset = typeof this.previewUrl === "string" ? this.previewUrl : null;
    this.previewDialog = this.dialog.open(DialogPreview4, {
      width: "871px",
      id: "previewMethod",
      data: { method },
    });

    this.previewDialog.afterClosed().subscribe();
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/method-preview.html",
  styleUrl: "../../../public/about/method/component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogClose],
})
export class DialogPreview4 {
  dialogRef = inject<MatDialogRef<DialogPreview4>>(MatDialogRef);
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
