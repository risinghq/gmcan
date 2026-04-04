import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import type { Software } from "@app/shared/models/software";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { SoftwareService } from "@app/shared/services/software.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-add-software",
  templateUrl: "./add-software.component.html",
  styleUrls: ["./add-software.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, AutosizeModule],
})
export default class AddSoftwareComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _softwareService = inject(SoftwareService);

  software: Software;
  softwareForm: FormGroup;
  button_text = "Guardar software";

  openEraser() {}
  edit = false;

  constructor() {
    this.software = { idSoftware: 0, nombre: "", descripcion: "", descripcionEN: "", moreInfo: "", grupo_idGrupo: 1 };
    this.softwareForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcion: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcionEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      moreInfo: [""],
    });
  }

  ngOnInit() {}

  isDirty(): boolean {
    return this.softwareForm.dirty;
  }

  submitSoftware(): void {
    this._softwareService.addSoftware(this.software).subscribe((res: any) => {
      if (res.status == 1) {
        this.softwareForm.markAsPristine();
        this.return();
        this.openSnackBar();
      }
    });
  }

  return(): void {
    this._router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar(): void {
    this._snackBar.open("Software agregado exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}
