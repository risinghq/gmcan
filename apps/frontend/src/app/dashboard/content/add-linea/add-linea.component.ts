import { NgClass } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { createLineasInvestigacion } from "@app/shared/models/factories";
import type { LineasInvestigacion } from "@app/shared/models/lineaInvestigacion";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { LineasInvestigacionService } from "@app/shared/services/lineasinvestigacion.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-add-linea",
  templateUrl: "./add-linea.component.html",
  styleUrls: ["./add-linea.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, AutosizeModule, NgClass],
})
export default class AddLineaComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _lineaInvestigacionService = inject(LineasInvestigacionService);

  button_text = "Guardar línea";
  lineaInvestigacion: LineasInvestigacion;
  public lineaForm: FormGroup;
  url: string;

  notCanDo = false;
  openEraser() {}
  edit = false;

  constructor() {
    this.lineaForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcion: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcionEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.lineaInvestigacion = createLineasInvestigacion();
    this.url = GLOBAL.url;
  }

  ngOnInit() {}

  isDirty(): boolean {
    return this.lineaForm.dirty;
  }

  submitLinea(): void {
    this._lineaInvestigacionService.addLinea(this.lineaInvestigacion).subscribe((result: any) => {
      if (result.status == 1) {
        if (this.fileData) {
          this._lineaInvestigacionService
            .uploadLineaFoto(this.fileData, result.idLineasInvestigacion)
            .subscribe((_res: any) => {});
        }
        this.lineaForm.markAsPristine();
        this.return();
        this.openSnackBar();
      }
    });
  }

  return(): void {
    this._router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar(): void {
    this._snackBar.open("Línea de investigación agregada exitosamente", undefined, {
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
}
