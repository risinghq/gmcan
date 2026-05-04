import { Component, OnInit, inject } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from "@angular/material/datepicker";
import { MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatOption, MatSelect } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { createMemberFull } from "@app/shared/models/factories";
import type { MemberFull } from "@app/shared/models/member";
import { AuthService } from "@app/shared/services/auth.service";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService, type MemberUpdateBody } from "@app/shared/services/member.service";
import { UiStateService } from "@app/shared/services/ui-state.service";
import { AutosizeModule } from "ngx-autosize";

type MemberStatus = 0 | 1 | 3;

const MEMBER_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
  BLOCKED: 3,
} as const satisfies Record<string, MemberStatus>;

const MIN_PASSWORD_LENGTH = 8;

@Component({
  selector: "app-perfil",
  templateUrl: "./perfil.component.html",
  styleUrl: "./perfil.component.scss",
  providers: [provideNativeDateAdapter()],
  imports: [
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
    MatButton,
    AutosizeModule,
  ],
})
export default class PerfilComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private memberService = inject(MemberService);
  private authService = inject(AuthService);
  lookup = inject(LookupService);
  private snackBar = inject(MatSnackBar);
  private uiState = inject(UiStateService);

  readonly url = GLOBAL.url;
  readonly minPasswordLength = MIN_PASSWORD_LENGTH;
  readonly memberStatusOptions = [
    { value: MEMBER_STATUS.ACTIVE, label: "Activo" },
    { value: MEMBER_STATUS.INACTIVE, label: "Inactivo" },
    { value: MEMBER_STATUS.BLOCKED, label: "Bloqueado" },
  ];

  member: MemberFull = { ...createMemberFull() };
  memberId: number | null = null;
  roleId: number | null = null;

  profileForm = this.formBuilder.group({
    firstName: ["", Validators.required],
    middleName: [""],
    lastName: ["", Validators.required],
    maternalName: [""],
    birthDate: [null as Date | null],
    email: ["", [Validators.required, Validators.email]],
    genderId: [null as number | null],
    prefixId: [null as number | null],
    memberTypeId: [null as number | null, Validators.required],
    dni: [{ value: "", disabled: true }, Validators.required],
    bio: ["", Validators.maxLength(500)],
    status: [MEMBER_STATUS.ACTIVE as MemberStatus, Validators.required],
  });

  passwordForm = this.formBuilder.group(
    {
      currentPassword: [""],
      newPassword: ["", [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
      confirmNewPassword: ["", Validators.required],
    },
    { validators: this.passwordsMatchValidator() },
  );

  fileData: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isSavingProfile = false;
  isSavingPassword = false;

  get tipoMiembros() {
    return this.lookup.memberTypes();
  }

  get prefijos() {
    return this.lookup.prefijos();
  }

  get generos() {
    return this.lookup.generos();
  }

  get photoUrl(): string | null {
    if (this.previewUrl && typeof this.previewUrl === "string") return this.previewUrl;
    if (!this.member.photo) return null;
    return `${this.url}api/assets/${this.member.photo}`;
  }

  ngOnInit(): void {
    this.getUser();
  }

  private passwordsMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const newPassword = control.get("newPassword")?.value as string | undefined;
      const confirmNewPassword = control.get("confirmNewPassword")?.value as string | undefined;
      if (!newPassword || !confirmNewPassword) return null;
      return newPassword === confirmNewPassword ? null : { passwordMismatch: true };
    };
  }

  private splitFirstAndMiddleName(name: string): { firstName: string; middleName: string } {
    const normalized = name.trim();
    if (!normalized) return { firstName: "", middleName: "" };
    const [firstName, ...rest] = normalized.split(/\s+/);
    return { firstName, middleName: rest.join(" ") };
  }

  private buildCanonicalFirstName(firstName: string, middleName: string): string {
    return [firstName.trim(), middleName.trim()].filter(Boolean).join(" ");
  }

  getUser(): void {
    this.authService.tryRestoreSession().subscribe((result) => {
      if (!result) return;

      this.member = { ...result };
      this.memberId = result.id;
      this.roleId = result.roleId;
      const splitNames = this.splitFirstAndMiddleName(result.firstName);

      const birthDate = result.birthDate ? new Date(result.birthDate) : null;
      if (birthDate) birthDate.setMinutes(birthDate.getMinutes() + birthDate.getTimezoneOffset());

      this.profileForm.reset({
        firstName: splitNames.firstName,
        middleName: splitNames.middleName,
        lastName: result.lastName,
        maternalName: result.maternalName ?? "",
        birthDate,
        email: result.email,
        genderId: result.genderId ?? null,
        prefixId: result.prefixId ?? null,
        memberTypeId: result.memberTypeId,
        dni: result.dni,
        bio: result.bio ?? "",
        status: (result.status as MemberStatus) ?? MEMBER_STATUS.ACTIVE,
      });
    });
  }

  actualizarUsuario(): void {
    if (this.profileForm.invalid || this.memberId === null || this.roleId === null) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const values = this.profileForm.getRawValue();
    const body: MemberUpdateBody = {
      email: values.email?.trim() ?? "",
      firstName: this.buildCanonicalFirstName(values.firstName ?? "", values.middleName ?? ""),
      lastName: values.lastName?.trim() ?? "",
      maternalName: values.maternalName?.trim() || undefined,
      birthDate: values.birthDate ? new Date(values.birthDate).toLocaleDateString("sv") : undefined,
      bio: values.bio?.trim() || undefined,
      status: (values.status ?? MEMBER_STATUS.ACTIVE) as MemberStatus,
      roleId: this.roleId,
      memberTypeId: values.memberTypeId ?? this.member.memberTypeId,
      prefixId: values.prefixId ?? undefined,
      genderId: values.genderId ?? undefined,
    };

    this.isSavingProfile = true;
    this.memberService.updateMember(this.memberId, body).subscribe({
      next: (result) => {
        if (result.status !== 1) return;

        if (this.fileData) {
          this.memberService.uploadPhoto(this.memberId!, this.fileData).subscribe({
            next: () => {
              this.fileData = null;
              this.previewUrl = null;
            },
          });
        }
        this.uiState.setProfileUpdated(true);
        this.openSnackBar("Información actualizada exitosamente");
        this.getUser();
      },
      error: () => this.openSnackBar("No se pudo actualizar el perfil", "snack-error"),
      complete: () => {
        this.isSavingProfile = false;
      },
    });
  }

  actualizarPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const newPassword = this.passwordForm.controls.newPassword.value ?? "";
    this.isSavingPassword = true;
    this.authService.updateMyPassword({ newPassword }).subscribe({
      next: (result) => {
        if (result.status !== 1) return;
        this.passwordForm.reset();
        this.openSnackBar("Contraseña actualizada exitosamente");
      },
      error: () => this.openSnackBar("No se pudo actualizar la contraseña", "snack-error"),
      complete: () => {
        this.isSavingPassword = false;
      },
    });
  }

  fileProgress(fileInput: Event): void {
    const input = fileInput.target as HTMLInputElement;
    this.fileData = input.files?.[0] ?? null;
    this.preview();
  }

  preview(): void {
    if (!this.fileData) {
      this.previewUrl = null;
      return;
    }

    const mimeType = this.fileData.type;
    if (!mimeType.match(/image\/*/)) return;

    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.addEventListener("load", () => {
      this.previewUrl = reader.result;
    });
  }

  openSnackBar(text: string, panel?: string): void {
    const panelClass = panel ? [panel] : [];
    this.snackBar.open(text, undefined, {
      panelClass,
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}
