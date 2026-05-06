import { Component, OnInit, HostListener, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { MatIconButton } from "@angular/material/button";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { createMemberFull } from "@app/shared/models/factories";
import type { MemberFull, MemberPublishability } from "@app/shared/models/member";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";

import { PublishabilityDialogComponent } from "../publishability-dialog.component";

@Component({
  selector: "app-add-member",
  templateUrl: "./add-member.component.html",
  styleUrl: "./add-member.component.scss",
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
export default class AddMemberComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  private memberService = inject(MemberService);
  lookup = inject(LookupService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  dialog = inject(MatDialog);

  public memberForm: FormGroup;
  member: MemberFull;
  segundoNombre = "";
  get generos() {
    return this.lookup.generos();
  }
  get tipoMiembros() {
    return this.lookup.memberTypes();
  }
  get prefijos() {
    return this.lookup.prefijos();
  }
  get bioLocales() {
    return this.lookup.locales().supported;
  }
  hide = true;
  hide2 = true;
  url: string;
  selectedBioLocale = "es";
  bioByLocale: Record<string, string> = {};
  publishability: MemberPublishability | null = null;

  button_text = "Registrar nuevo miembro";

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
      password: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      confirmPassword: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      bioLocale: ["es", [Validators.required]],
      bio: [""],
    });
    this.url = GLOBAL.url;
    this.member = createMemberFull();
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.returnValue = false;
  }

  ngOnInit(): void {
    this.selectedBioLocale = this.lookup.locales().default || this.bioLocales[0] || "es";
    this.memberForm.controls["bioLocale"].setValue(this.selectedBioLocale);
    this.memberForm.controls["bio"].setValue(this.bioByLocale[this.selectedBioLocale] ?? "");
    this.memberForm.controls["bioLocale"].valueChanges.subscribe((locale) => {
      if (!locale) return;
      this.setBioLocale(locale);
    });
    this.memberForm.controls["bio"].valueChanges.subscribe((bio) => {
      this.setBioForSelectedLocale(bio ?? "");
    });
  }

  isDirty(): boolean {
    return this.memberForm.dirty;
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
      const birthDate = values.birthDate ? new Date(values.birthDate).toLocaleDateString("sv") : undefined;

      let status: number;
      if (this.adHono === 3) {
        status = 3;
      } else if (this.oldMem === 0) {
        status = 0;
      } else {
        status = 1;
      }

      this.memberService.verifyEmail(values.email).subscribe((result) => {
        if (!result.exists) {
          if (values.password === this.memberForm.controls["confirmPassword"].value) {
            const bio = this.bioByLocale[this.selectedBioLocale] ?? "";
            this.memberService
              .createMember({
                dni: values.dni,
                email: values.email,
                password: values.password,
                firstName,
                lastName: values.lastName,
                maternalName: values.maternalName ?? undefined,
                birthDate,
                status,
                roleId: this.member.roleId,
                memberTypeId: values.memberTypeId,
                prefixId: values.prefixId || undefined,
                genderId: values.genderId || undefined,
                translation: { locale: this.selectedBioLocale, bio },
              })
              .subscribe((res) => {
                if (res.id) {
                  if (this.fileData) {
                    this.memberService.uploadAsset(res.id, this.fileData).subscribe();
                  }
                  this.openSnackBar("Miembro agregado exitosamente");
                  this.memberForm.markAsPristine();
                  this.return();
                }
              });
          } else {
            this.openSnackBar("Las contraseñas no coinciden", "err-snackbar");
            this.errPass = true;
            this.errEmail = false;
          }
        } else {
          this.openSnackBar("Este usuario ya se encuentra registrado", "err-snackbar");
          this.errEmail = true;
        }
      });
    }
  }

  openSnackBar(text: string, panel: string = ""): void {
    this.snackBar.open(text, undefined, {
      panelClass: panel ? panel : undefined,
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
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

  return() {
    this.router.navigate(["dashboard/miembros-activos"]);
  }

  setBioLocale(locale: string): void {
    this.selectedBioLocale = locale;
    this.memberForm.controls["bio"].setValue(this.bioByLocale[this.selectedBioLocale] ?? "", { emitEvent: false });
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

  openPublishabilityDetails(): void {
    if (!this.publishability) return;
    this.dialog.open(PublishabilityDialogComponent, {
      width: "560px",
      data: {
        memberName: `${this.member.firstName} ${this.member.lastName}`.trim(),
        publishability: this.publishability,
      },
    });
  }

  openEraser() {}
  edit = false;
}
