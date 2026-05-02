import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import type { Equipment } from "@app/shared/models/equipment";
import { createEquipment } from "@app/shared/models/factories";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GroupService } from "@app/shared/services/group.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";

@Component({
  selector: "app-add-equipo",
  templateUrl: "./add-equipo.component.html",
  styleUrl: "./add-equipo.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class AddEquipoComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private groupService = inject(GroupService);

  equipo: Equipment;
  equipoForm: FormGroup;
  button_text = "Guardar equipo";

  edit = false;
  openEraser() {}

  constructor() {
    this.equipo = createEquipment();
    this.equipoForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      cpu: [""],
      gpu: [""],
      ram: [""],
      hd: [""],
    });
  }

  ngOnInit() {}

  isDirty(): boolean {
    return this.equipoForm.dirty;
  }

  submitEquipo(): void {
    if (this.equipoForm.valid) {
      this.groupService
        .createEquipment({
          name: this.equipo.name,
          cpu: this.equipo.cpu ?? undefined,
          gpu: this.equipo.gpu ?? undefined,
          ram: this.equipo.ram ?? undefined,
          storage: this.equipo.storage ?? undefined,
          groupId: this.equipo.groupId,
        })
        .subscribe((res) => {
          if (res.id) {
            this.equipoForm.markAsPristine();
            this.return();
            this.openSnackBar();
          }
        });
    }
  }

  return(): void {
    this.router.navigate(["dashboard/contenidos"]);
  }

  openSnackBar(): void {
    this.snackBar.open("Equipo agregado exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}
