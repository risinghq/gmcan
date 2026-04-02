import { NgIf, NgClass } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";

import { Universidad } from "../models/universidad";
import { CommonService } from "../services/common.service";
import { SpaceValidator } from "../services/spacevalidator";
import { UniversidadService } from "../services/universidad.service";

@Component({
  selector: "app-add-universidad",
  templateUrl: "./add-universidad.component.html",
  styleUrls: ["./add-universidad.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgIf, NgClass],
})
export class AddUniversidadComponent implements OnInit {
  universidad: Universidad;
  public universidadForm: FormGroup;
  button_text = "Guardar universidad";
  notCanDo;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _universidadService: UniversidadService,
    private _commonService: CommonService,
  ) {
    this.universidad = new Universidad(null, "", "", null, null);
    this.universidadForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit() {}

  agregar;

  submitUniversidad() {
    this._universidadService.addUniversidad(this.universidad).subscribe((result) => {
      if (result.status == 1) {
        this.return();
        this.openSnackBar();
        this.agregar = true;
      }
    });
  }

  return() {
    this._commonService.setEndSession("0");
    this._router.navigate(["dashboard/tesis"]);
  }

  openSnackBar() {
    this._snackBar.open("Universidad agregada exitosamente", null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  openEraser() {}
  edit;
}
