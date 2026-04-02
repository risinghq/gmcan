import { NgIf, NgClass } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";

import { Equipo } from "../models/equipo";
import { CommonService } from "../services/common.service";
import { EquipoService } from "../services/equipo.service";
import { SpaceValidator } from "../services/spacevalidator";

@Component({
  selector: "app-add-equipo",
  templateUrl: "./add-equipo.component.html",
  styleUrls: ["./add-equipo.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgIf, NgClass],
})
export class AddEquipoComponent implements OnInit {
  equipo: Equipo;
  equipoForm: FormGroup;
  button_text = "Guardar equipo";

  edit;
  openEraser() {}

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _equipoService: EquipoService,
  ) {
    this.equipo = new Equipo(null, "", "", "", "", "", 1, null, null);
    this.equipoForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      cpu: [""],
      gpu: [""],
      ram: [""],
      hd: [""],
    });
  }

  ngOnInit() {}

  submitEquipo() {
    if (this.equipoForm.valid) {
      this._equipoService.addEquipo(this.equipo).subscribe((res) => {
        if (res.status == 1) {
          this.agregar = true;
          this.return();
          this.openSnackBar();
        }
      });
    }
  }

  agregar;

  return() {
    this._commonService.setEndSession("0");
    this._router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar() {
    this._snackBar.open("Equipo agregado exitosamente", null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}
