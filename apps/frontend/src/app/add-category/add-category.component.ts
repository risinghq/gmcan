import { Component, OnInit, Inject, HostListener } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

import { DialogData } from "../models/dialogdata";
import { TipoNoticia } from "../models/tiponoticia";
import { CommonService } from "../services/common.service";
import { SpaceValidator } from "../services/spacevalidator";
import { TipoNoticiaService } from "../services/tiponoticia.service";

@Component({
  standalone: false,
  selector: "app-add-category",
  templateUrl: "./add-category.component.html",
  styleUrls: ["./add-category.component.scss"],
})
export class AddCategoryComponent implements OnInit {
  category: TipoNoticia;
  public categoryForm: FormGroup;
  button_text = "Agregar categoría";
  agregar;
  notCanDo;
  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    public _tipoNoticiaService: TipoNoticiaService,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
  ) {
    this.categoryForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.category = new TipoNoticia(null, "", "");
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.returnValue = false;
  }

  ngOnInit() {}

  private dialogRef: MatDialogRef<DialogCancel>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel, {
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

  return() {
    this.agregar = false;
    this._commonService.setEndSession("0");
    this._router.navigate(["dashboard/noticias"]);
  }

  submitCategory() {
    if (this.categoryForm.valid) {
      this._tipoNoticiaService.addCategory(this.category).subscribe((result) => {
        if (result.status == 1) {
          this.return();
          this.openSnackBar();
          this.agregar = true;
        }
      });
    }
  }

  openSnackBar() {
    this._snackBar.open("Categoría agregada exitosamente", null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
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

  edit;

  openEraser() {}
}

@Component({
  standalone: false,
  selector: "dialog-content-example-dialog",
  templateUrl: "../modals/dialog-options.html",
})
export class DialogCancel {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
