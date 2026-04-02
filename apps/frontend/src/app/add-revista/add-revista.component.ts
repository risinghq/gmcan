import { NgIf, NgClass } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";

import { Revista } from "../models/revista";
import { CommonService } from "../services/common.service";
import { RevistaService } from "../services/revista.service";
import { SpaceValidator } from "../services/spacevalidator";

@Component({
  selector: "app-add-revista",
  templateUrl: "./add-revista.component.html",
  styleUrls: ["./add-revista.component.scss"],
  imports: [MatIcon, FormsModule, ReactiveFormsModule, NgIf, NgClass],
})
export class AddRevistaComponent implements OnInit {
  revista: Revista;
  public revistaForm: FormGroup;
  button_text = "Guardar revista";

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _revistaService: RevistaService,
    private _commonService: CommonService,
  ) {
    this.revista = new Revista(null, "");
    this.revistaForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit() {}

  agregar;
  notCanDo;
  edit;
  openEraser() {}

  submitRevista() {
    this._revistaService.addRevista(this.revista).subscribe((result) => {
      if (result.status == 1) {
        this.return();
        this.openSnackBar();
        this.agregar = true;
      }
    });
  }

  return() {
    this._commonService.setEndSession("0");
    this._router.navigate(["dashboard/articulos"]);
  }

  openSnackBar() {
    this._snackBar.open("Revista agregada exitosamente", null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}
