import { NgIf, NgClass } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";

import { FuenteFinanciamiento } from "../models/fuentefinanciamiento";
import { CommonService } from "../services/common.service";
import { FuenteFinanciamientoService } from "../services/fuentefinanciamiento.service";
import { SpaceValidator } from "../services/spacevalidator";

@Component({
  selector: "app-add-fuente",
  templateUrl: "./add-fuente.component.html",
  styleUrls: ["./add-fuente.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgIf, NgClass],
})
export class AddFuenteComponent implements OnInit {
  fuente: FuenteFinanciamiento;
  public fuenteForm: FormGroup;
  button_text = "Guardar fuente";

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _fuenteFinanciamientoService: FuenteFinanciamientoService,
    private _commonService: CommonService,
  ) {
    this.fuente = new FuenteFinanciamiento(null, "");
    this.fuenteForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit() {}

  agregar;
  notCanDo;
  openEraser() {}
  edit;

  submitFuente() {
    this._fuenteFinanciamientoService.addFuenteFinanciamiento(this.fuente).subscribe((result) => {
      if (result.status == 1) {
        this.return();
        this.openSnackBar();
        this.agregar = true;
      }
    });
  }

  return() {
    this._commonService.setEndSession("0");
    this._router.navigate(["dashboard/proyectos-ejecucion"]);
  }

  openSnackBar() {
    this._snackBar.open("Fuente agregada exitosamente", null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}
