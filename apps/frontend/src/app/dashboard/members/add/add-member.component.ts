import { Component, OnInit, HostListener, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
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
import type { MemberFull } from "@app/shared/models/member";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-add-member",
  templateUrl: "./add-member.component.html",
  styleUrl: "./add-member.component.scss",
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
  birthDateObj?: Date;
  password = "";
  get generos() {
    return this.lookup.generos();
  }
  get tipoMiembros() {
    return this.lookup.memberTypes();
  }
  get prefijos() {
    return this.lookup.prefijos();
  }
  hide = true;
  hide2 = true;
  url: string;

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
      bio: [""],
    });
    this.url = GLOBAL.url;
    this.member = createMemberFull();
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.returnValue = false;
  }

  ngOnInit(): void {}

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
      const firstName = this.segundoNombre
        ? `${this.member.firstName} ${this.segundoNombre}`.trim()
        : this.member.firstName;
      const birthDate = this.birthDateObj ? new Date(this.birthDateObj).toLocaleDateString("sv") : undefined;

      let status: number;
      if (this.adHono === 3) {
        status = 3;
      } else if (this.oldMem === 0) {
        status = 0;
      } else {
        status = 1;
      }

      this.memberService.verifyEmail(this.member.email).subscribe((result: unknown) => {
        const list = result as unknown[];
        if (list.length === 0) {
          if (this.password === this.memberForm.controls["confirmPassword"].value) {
            this.memberService
              .createMember({
                dni: this.member.dni,
                email: this.member.email,
                password: this.password,
                firstName,
                lastName: this.member.lastName,
                maternalName: this.member.maternalName ?? undefined,
                birthDate,
                bio: this.member.bio ?? undefined,
                status,
                roleId: this.member.roleId,
                memberTypeId: this.member.memberTypeId,
                prefixId: this.member.prefixId ?? undefined,
                genderId: this.member.genderId ?? undefined,
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

  openEraser() {}
  edit = false;
}
