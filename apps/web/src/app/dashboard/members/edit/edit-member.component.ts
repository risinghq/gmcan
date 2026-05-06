import { CdkScrollable } from "@angular/cdk/scrolling";
import { Component, OnInit, HostListener, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
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
import type { MemberFull, MemberPublishability } from "@app/shared/models/member";
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
  get bioLocales() {
    return this.lookup.locales().supported;
  }
  button_text = "Actualizar información";
  edit = true;
  selectedBioLocale = "es";
  bioByLocale: Record<string, string> = {};
  publishability: MemberPublishability | null = null;

  constructor() {
    this.memberForm = this.formBuilder.group({
      firstName: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      middleName: [""],
      lastName: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      maternalName: [""],
      birthDate: [""],
      email: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      genderId: [""],
      prefixId: [""],
      memberTypeId: ["", [Validators.required]],
      dni: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      password: ["", [SpaceValidator.cannotContainSpace]],
      confirmPassword: ["", [SpaceValidator.cannotContainSpace]],
      bioLocale: ["es", [Validators.required]],
      bio: [""],
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
    this.selectedBioLocale = this.lookup.locales().default || this.bioLocales[0] || "es";
    this.memberForm.controls["bioLocale"].setValue(this.selectedBioLocale);
    this.memberForm.controls["bioLocale"].valueChanges.subscribe((locale) => {
      if (!locale) return;
      this.setBioLocale(locale);
    });
    this.memberForm.controls["bio"].valueChanges.subscribe((bio) => {
      this.setBioForSelectedLocale(bio ?? "");
    });
    this.bindUser(this.route.snapshot.data["member"] as MemberFull);
    this.loadPublishability();
  }

  isDirty(): boolean {
    return this.memberForm.dirty;
  }

  private bindUser(result: MemberFull): void {
    this.memberForm.controls["dni"].disable();
    this.member = result;
    this.bioByLocale[this.selectedBioLocale] = result.bio ?? "";
    this.oldEmail = result.email ?? "";

    const birthDate = result.birthDate ? parseLocalDate(result.birthDate) : null;
    if (result.firstName.includes(" ")) {
      const parts = result.firstName.split(" ");
      this.member.firstName = parts[0] ?? "";
      this.segundoNombre = parts.slice(1).join(" ");
    }

    this.memberForm.patchValue(
      {
        firstName: this.member.firstName,
        middleName: this.segundoNombre,
        lastName: result.lastName,
        maternalName: result.maternalName ?? "",
        birthDate,
        email: result.email,
        genderId: result.genderId ?? "",
        prefixId: result.prefixId ?? "",
        memberTypeId: result.memberTypeId,
        dni: result.dni,
        bioLocale: this.selectedBioLocale,
        bio: this.bioByLocale[this.selectedBioLocale] ?? "",
      },
      { emitEvent: false },
    );
    this.memberForm.controls["confirmPassword"].setValue("");
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
      const values = this.memberForm.getRawValue();
      const firstName = values.middleName ? `${values.firstName} ${values.middleName}`.trim() : values.firstName;
      const birthDate = values.birthDate ? toIsoDate(values.birthDate) : undefined;

      let status: number;
      if (this.adHono === 3) {
        status = 3;
      } else if (this.oldMem === 0) {
        status = 0;
      } else if (!values.status) {
        status = 1;
      } else {
        status = values.status;
      }

      const doUpdate = () => {
        const password = values.password;
        const confirmPass = this.memberForm.controls["confirmPassword"].value;
        if (password && password !== confirmPass) {
          this.openSnackBar("Las contraseñas no coinciden", "err-snackbar");
          this.errPass = true;
          return;
        }
        this.memberService
          .updateMember(this.member.id, {
            email: values.email,
            firstName,
            lastName: values.lastName,
            maternalName: values.maternalName ?? undefined,
            birthDate,
            status,
            roleId: this.member.roleId,
            memberTypeId: values.memberTypeId,
            prefixId: values.prefixId || undefined,
            genderId: values.genderId || undefined,
            translation: { locale: this.selectedBioLocale, bio: this.bioByLocale[this.selectedBioLocale] ?? "" },
          })
          .subscribe((res) => {
            if (res.status === 1) {
              if (this.fileData) {
                this.memberService.uploadAsset(this.member.id, this.fileData).subscribe();
              }
              this.openSnackBar("Miembro actualizado exitosamente");
              this.loadPublishability();
              this.memberForm.markAsPristine();
              this.return();
            }
          });
      };

      if (this.oldEmail !== values.email) {
        this.memberService.verifyEmail(values.email).subscribe((result) => {
          if (!result.exists) {
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
    const returnTo =
      this.route.snapshot.queryParamMap.get("returnTo") === "miembros-antiguos"
        ? "miembros-antiguos"
        : "miembros-activos";
    this.router.navigate(["dashboard/" + returnTo]);
  }

  setBioLocale(locale: string): void {
    this.selectedBioLocale = locale;
    if (!this.member.id) return;
    this.memberService.getMemberTranslation(this.member.id, locale).subscribe((row) => {
      this.bioByLocale[locale] = row.bio ?? "";
      this.memberForm.controls["bio"].setValue(this.bioByLocale[locale] ?? "", { emitEvent: false });
      this.loadPublishability();
    });
  }

  setBioForSelectedLocale(value: string): void {
    this.bioByLocale[this.selectedBioLocale] = value;
  }

  bioLength(): number {
    return (this.bioByLocale[this.selectedBioLocale] ?? "").length;
  }

  missingRequirementsCount(): number {
    if (!this.publishability) return 0;
    return (
      this.publishability.missing.base.length +
      Object.values(this.publishability.missing.translations).reduce((sum, fields) => sum + fields.length, 0)
    );
  }

  publishabilityTooltip(): string {
    if (!this.publishability) return "Estado de publicación no disponible";
    if (this.publishability.publishable) return "Ready para mostrarse en público";
    return `Borrador: ${this.missingRequirementsCount()} requisito(s) pendiente(s)`;
  }

  private loadPublishability(): void {
    if (!this.member.id) return;
    this.memberService.getMemberPublishability(this.member.id).subscribe((data) => {
      this.publishability = data;
    });
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
