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
import { createSoftware } from "@app/shared/models/factories";
import type { Software } from "@app/shared/models/software";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GroupService } from "@app/shared/services/group.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-edit-software",
  templateUrl: "../add-software/add-software.component.html",
  styleUrl: "../add-software/add-software.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule, AutosizeModule],
})
export default class EditSoftwareComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _groupService = inject(GroupService);

  edit = true;
  software: Software;
  softwareForm: FormGroup;
  button_text = "Actualizar información";

  constructor() {
    this.software = createSoftware();
    this.softwareForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcion: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcionEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      moreInfo: [""],
    });
  }

  ngOnInit() {
    this.getSoftware();
  }

  isDirty(): boolean {
    return this.softwareForm.dirty;
  }

  getSoftware(): void {
    const idSoftware = Number(this._route.snapshot.params["id"]);
    this._groupService.getSoftwareItem(idSoftware).subscribe((result: unknown) => {
      const sw = result as Software;
      if (sw) {
        this.software = sw;
        localStorage.setItem("softwareEdit", JSON.stringify(sw.name));
      }
    });
  }

  submitSoftware(): void {
    if (this.softwareForm.valid) {
      this._groupService
        .updateSoftware(this.software.id, {
          name: this.software.name ?? undefined,
          description: this.software.description ?? undefined,
          descriptionEN: this.software.descriptionEN ?? undefined,
          moreInfo: this.software.moreInfo ?? undefined,
        })
        .subscribe((res) => {
          if (res.status === 1) {
            this.softwareForm.markAsPristine();
            this.return();
            this.openSnackBar("Software actualizado exitosamente");
          }
        });
    }
  }

  return(): void {
    this._router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar(value: string): void {
    this._snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  private dialogRef2?: MatDialogRef<DialogErase14>;

  openEraser(): void {
    this.dialogRef2 = this.dialog.open(DialogErase14, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "Eliminar software",
        text: "¿Estás seguro que deseas eliminar este software?",
        cancel: "Sí, eliminar",
        yes: "No, cancelar",
      },
    });
    this.dialogRef2.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.eraseSoftware();
      }
    });
  }

  eraseSoftware(): void {
    this._groupService.deleteSoftware(this.software.id).subscribe((result) => {
      if (result.status === 1) {
        this.softwareForm.markAsPristine();
        this.return();
        this.openSnackBar("Software eliminado exitosamente");
      } else {
        this.openSnackBar("Hubo un problema al eliminar");
      }
    });
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase14 {
  dialogRef = inject<MatDialogRef<DialogErase14>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
