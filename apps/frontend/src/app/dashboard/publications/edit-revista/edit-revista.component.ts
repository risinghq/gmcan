import { CdkScrollable } from "@angular/cdk/scrolling";
import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogData } from "@app/shared/models/dialogdata";
import type { Revista } from "@app/shared/models/revista";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { AdminRevistaService } from "@app/shared/services/admin-revista.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

interface StatusResponse {
  status?: number;
}

@Component({
  selector: "app-edit-revista",
  templateUrl: "../add-revista/add-revista.component.html",
  styleUrl: "../add-revista/add-revista.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class EditRevistaComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _adminRevistaService = inject(AdminRevistaService);
  private lookup = inject(LookupService);
  private _publicacionService = inject(PublicacionService);

  revista: Revista;
  public revistaForm: FormGroup;
  button_text = "Actualizar revista";
  edit = true;

  constructor() {
    this.revista = { idRevista: 0, nombre: "" };
    this.revistaForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit(): void {
    this.getRevista();
  }

  isDirty(): boolean {
    return this.revistaForm.dirty;
  }

  getRevista(): void {
    const idRevista = Number(this._route.snapshot.params["id"] ?? 0);
    const found = this.lookup.revistas().find((r) => r.idRevista === idRevista);
    if (found) {
      this.revista = found;
      localStorage.setItem("revistaEdit", JSON.stringify(this.revista.nombre ?? ""));
      this.getPublicacionRevista(idRevista);
    }
  }

  notCanDo = false;

  getPublicacionRevista(idRevista: number): void {
    this._publicacionService.getPublicacionesRevista(idRevista).subscribe((result: unknown[]) => {
      if (result.length == 0) {
        this.notCanDo = true;
      }
    });
  }

  submitRevista(): void {
    this._adminRevistaService.updateRevista(this.revista).subscribe((result: StatusResponse) => {
      if (result.status == 1) {
        this.revistaForm.markAsPristine();
        this.return();
        this.openSnackBar("Revista actualizada exitosamente");
      }
    });
  }

  return(): void {
    this._router.navigate(["dashboard/articulos"]);
  }

  private dialogRef2?: MatDialogRef<DialogErase3>;

  openEraser(): void {
    if (this.notCanDo) {
      this.dialogRef2 = this.dialog.open(DialogErase3, {
        width: "530px",
        id: "idleTimer",
        data: {
          title: "Eliminar noticia",
          text: "¿Estás seguro que deseas eliminar esta noticia?",
          cancel: "Sí, eliminar",
          yes: "No, cancelar",
        },
      });
      this.dialogRef2.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.eraseNews();
        }
      });
    }
  }

  openSnackBar(value: string): void {
    this._snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  eraseNews(): void {
    if (this.notCanDo) {
      this._adminRevistaService.deleteRevista(this.revista.idRevista ?? 0).subscribe((result: StatusResponse) => {
        if (result.status == 1) {
          this.revistaForm.markAsPristine();
          this.return();
          this.openSnackBar("Revista eliminada exitosamente");
        } else {
          this.openSnackBar("Hubo un problema al eliminar");
        }
      });
    }
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase3 {
  dialogRef = inject<MatDialogRef<DialogErase3>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
