import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { createResearchLine } from "@app/shared/models/factories";
import type { ResearchLine } from "@app/shared/models/research-line";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-add-linea",
  templateUrl: "./add-linea.component.html",
  styleUrl: "./add-linea.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule, AutosizeModule],
})
export default class AddLineaComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private researchLinesService = inject(ResearchLinesService);

  button_text = "Guardar línea";
  lineaInvestigacion: ResearchLine;
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
    this.lineaInvestigacion = createResearchLine();
    this.url = GLOBAL.url;
  }

  ngOnInit() {}

  isDirty(): boolean {
    return this.lineaForm.dirty;
  }

  submitLinea(): void {
    if (this.lineaForm.valid) {
      this.researchLinesService
        .create({
          name: this.lineaInvestigacion.name,
          nameEN: this.lineaInvestigacion.nameEN,
          description: this.lineaInvestigacion.description ?? undefined,
          descriptionEN: this.lineaInvestigacion.descriptionEN ?? undefined,
          groupId: this.lineaInvestigacion.groupId,
        })
        .subscribe((result) => {
          if (result.id) {
            if (this.fileData) {
              this.researchLinesService.uploadPhoto(result.id, this.fileData).subscribe();
            }
            this.lineaForm.markAsPristine();
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
    this.snackBar.open("Línea de investigación agregada exitosamente", undefined, {
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
}
