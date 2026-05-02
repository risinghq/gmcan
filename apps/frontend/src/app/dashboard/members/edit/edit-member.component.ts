import { CdkScrollable } from "@angular/cdk/scrolling";
import { Component, OnInit, HostListener, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIconButton } from "@angular/material/button";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from "@angular/material/datepicker";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from "@angular/material/dialog";
import { MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router, ActivatedRoute } from "@angular/router";
import { DialogData } from "@app/shared/models/dialogdata";
import { createMemberFull } from "@app/shared/models/factories";
import type { MemberFull } from "@app/shared/models/member";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { parseLocalDate, toIsoDate } from "@app/shared/utils/date";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-edit-member",
  templateUrl: "../add/add-member.component.html",
  styleUrl: "./edit-member.component.scss",
  providers: [provideNativeDateAdapter()],
  imports: [
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatSelect,
    MatOption,
    MatIconButton,
    AutosizeModule,
  ],
})
export default class EditMemberComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  private memberService = inject(MemberService);
  lookup = inject(LookupService);
  private snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);

  url: string;
  public memberForm: FormGroup;
  member: MemberFull;
  segundoNombre = "";
  birthDateObj?: Date;
  password = "";
  private oldPassword = "";
  private oldEmail = "";
  get tipoMiembros() {
    return this.lookup.memberTypes();
  }
  get prefijos() {
    return this.lookup.prefijos();
  }
  get generos() {
    return this.lookup.generos();
  }
  button_text = "Actualizar información";
  edit = true;

  constructor() {
    this.memberForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      segundoNombre: [""],
      apellidoPaterno: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      apellidoMaterno: [""],
      fechaNacimiento: [""],
      correo: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      genero_idGenero: [""],
      prefijo_idPrefijo: [""],
      tipoMiembro_idTipoMiembro: ["", [Validators.required]],
      DNI: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      password: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      confirmPassword: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      bio: [""],
      bioEN: [""],
    });
    this.member = createMemberFull();
    this.url = GLOBAL.url;
  }

  hide = true;
  hide2 = true;

  @HostListener("window:beforeunload", ["$event"])
  unloadHandler(event: Event): void {
    event.returnValue = false;
  }

  ngOnInit(): void {
    this.getUser();
  }

  isDirty(): boolean {
    return this.memberForm.dirty;
  }

  getUser(): void {
    const id = Number(this.route.snapshot.params["id"] ?? 0);
    this.memberService.getMemberFull(id).subscribe((result: MemberFull) => {
      if (result) {
        this.memberForm.controls["DNI"].disable();
        this.member = result;
        this.oldEmail = result.email ?? "";

        if (result.birthDate) {
          this.birthDateObj = parseLocalDate(result.birthDate);
        }

        const fullName =
          `${result.firstName} ${result.lastName}${result.maternalName ? " " + result.maternalName : ""}`.trim();
        localStorage.setItem("miembroEdit", JSON.stringify(fullName));

        if (result.firstName.includes(" ")) {
          const parts = result.firstName.split(" ");
          this.member.firstName = parts[0] ?? "";
          this.segundoNombre = parts.slice(1).join(" ");
        }

        this.memberForm.controls["confirmPassword"].setValue("");
      }
    });
  }

  adHono = 0;

  setCoord(value: number): void {
    this.member.roleId = value;
  }

  adHonorem(value: number): void {
    this.adHono = value;
  }

  oldMem = 0;
  oldMember(value: number): void {
    this.oldMem = value;
  }

  errPass = false;
  errEmail = false;

  addMember(): void {
    if (this.memberForm.valid) {
      const firstName = this.segundoNombre
        ? `${this.member.firstName} ${this.segundoNombre}`.trim()
        : this.member.firstName;
      const birthDate = this.birthDateObj ? toIsoDate(this.birthDateObj) : undefined;

      let status: number;
      if (this.adHono === 3) {
        status = 3;
      } else if (this.oldMem === 0) {
        status = 0;
      } else if (!this.member.status) {
        status = 1;
      } else {
        status = this.member.status;
      }

      const doUpdate = () => {
        const confirmPass = this.memberForm.controls["confirmPassword"].value;
        if (this.password && this.password !== confirmPass) {
          this.openSnackBar("Las contraseñas no coinciden", "err-snackbar");
          this.errPass = true;
          return;
        }
        this.memberService
          .updateMember(this.member.id, {
            email: this.member.email,
            firstName,
            lastName: this.member.lastName,
            maternalName: this.member.maternalName ?? undefined,
            birthDate,
            bio: this.member.bio ?? undefined,
            bioEN: this.member.bioEN ?? undefined,
            status,
            roleId: this.member.roleId,
            memberTypeId: this.member.memberTypeId,
            prefixId: this.member.prefixId ?? undefined,
            genderId: this.member.genderId ?? undefined,
          })
          .subscribe((res) => {
            if (res.status === 1) {
              if (this.fileData) {
                this.memberService.uploadPhoto(this.member.id, this.fileData).subscribe();
              }
              this.openSnackBar("Miembro actualizado exitosamente");
              this.memberForm.markAsPristine();
              this.return();
            }
          });
      };

      if (this.oldEmail !== this.member.email) {
        this.memberService.verifyEmail(this.member.email).subscribe((result: unknown) => {
          const list = result as unknown[];
          if (list.length === 0) {
            doUpdate();
          } else {
            this.openSnackBar("Este usuario ya se encuentra registrado", "err-snackbar");
            this.errEmail = true;
          }
        });
      } else {
        doUpdate();
      }
    }
  }

  fileData: File | null = null;
  previewUrl: unknown = null;
  fileProgress(fileInput: Event): void {
    const input = fileInput.target as HTMLInputElement;
    this.fileData = input.files?.[0] ?? null;
    this.preview();
  }

  preview(): void {
    if (!this.fileData) return;
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) return;
    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.addEventListener("load", () => {
      this.previewUrl = reader.result;
    });
  }

  openSnackBar(text: string, panel?: string): void {
    this.snackBar.open(text, undefined, {
      panelClass: panel ? [panel] : [],
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  return(): void {
    if (localStorage.getItem("active-member") === "1") {
      this.router.navigate(["dashboard/miembros-activos"]);
    } else {
      this.router.navigate(["dashboard/miembros-antiguos"]);
    }
  }

  private dialogRef2?: MatDialogRef<DialogCancel5>;

  openEraser(): void {
    this.dialogRef2 = this.dialog.open(DialogCancel5, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "Eliminar miembro",
        text: "¿Estás seguro que deseas eliminar a este miembro del grupo?",
        cancel: "Sí, eliminar",
        yes: "No, cancelar",
      },
    });
    this.dialogRef2.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.eraseMember();
      }
    });
  }

  eraseMember(): void {
    this.memberService.deleteMember(this.member.id).subscribe((result) => {
      if (result.status === 1) {
        this.memberForm.markAsPristine();
        this.return();
        this.openSnackBar("Usuario eliminado exitosamente");
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
export class DialogCancel5 {
  dialogRef = inject<MatDialogRef<DialogCancel5>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
