import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { DialogData } from "../models/dialogdata";
import { Revista } from "../models/revista";
import { CommonService } from "../services/common.service";
import { RevistaService } from "../services/revista.service";
import { SpaceValidator } from "../services/spacevalidator";

@Component({
  standalone: false,
  selector: "app-add-revista",
  templateUrl: "./add-revista.component.html",
  styleUrls: ["./add-revista.component.scss"],
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

  private dialogRef: MatDialogRef<DialogCancel6>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel6, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "¿Estás seguro que deseas volver sin guardar?",
        text: "La información no se guardará",
        cancel: "Sí, volver",
        yes: "No, mantenerme aquí",
      },
    });
  }

  canDeactivate(): Observable<boolean> {
    if (!this.agregar) {
      this.openDialog();
      return this.dialogRef.afterClosed().pipe(
        map((result) => {
          return result === true;
        }),
      );
    } else {
      return;
    }
  }
}

@Component({
  standalone: false,
  selector: "dialog-content-example-dialog",
  templateUrl: "../modals/dialog-options.html",
})
export class DialogCancel6 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel6>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
