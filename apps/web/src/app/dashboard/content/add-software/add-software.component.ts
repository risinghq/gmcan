import { Component, OnInit, inject, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { createSoftware } from "@app/shared/models/factories";
import type { Software } from "@app/shared/models/software";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GroupService } from "@app/shared/services/group.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-add-software",
  templateUrl: "./add-software.component.html",
  styleUrl: "./add-software.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon, FormsModule, ReactiveFormsModule, AutosizeModule],
})
export default class AddSoftwareComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private groupService = inject(GroupService);

  software: Software;
  softwareForm: FormGroup;
  button_text = "Guardar software";

  openEraser() {}
  edit = false;

  constructor() {
    this.software = createSoftware();
    this.softwareForm = this.formBuilder.group({
      name: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      description: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      moreInfo: [""],
    });
  }

  ngOnInit() {}

  isDirty(): boolean {
    return this.softwareForm.dirty;
  }

  submitSoftware(): void {
    if (this.softwareForm.valid) {
      this.groupService
        .createSoftware({
          name: this.software.name ?? undefined,
          description: this.software.description ?? undefined,
          moreInfo: this.software.moreInfo ?? undefined,
          groupId: this.software.groupId,
        })
        .subscribe((res) => {
          if (res.id) {
            this.softwareForm.markAsPristine();
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
    this.snackBar.open("Software agregado exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}
