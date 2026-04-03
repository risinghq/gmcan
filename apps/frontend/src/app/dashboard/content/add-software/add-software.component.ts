import { NgIf, NgClass } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { Software } from "@app/shared/models/software";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { SoftwareService } from "@app/shared/services/software.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-add-software",
  templateUrl: "./add-software.component.html",
  styleUrls: ["./add-software.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, AutosizeModule, NgIf, NgClass],
})
export default class AddSoftwareComponent implements OnInit, HasUnsavedChanges {
  software: Software;
  softwareForm: FormGroup;
  button_text = "Guardar software";

  openEraser() {}
  edit;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _softwareService: SoftwareService,
  ) {
    this.software = new Software(null, "", "", "", "", 1, null, null);
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

  submitSoftware() {
    this._softwareService.addSoftware(this.software).subscribe((res) => {
      if (res.status == 1) {
        this.softwareForm.markAsPristine();
        this.return();
        this.openSnackBar();
      }
    });
  }

  return() {
    this._router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar() {
    this._snackBar.open("Software agregado exitosamente", null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}
