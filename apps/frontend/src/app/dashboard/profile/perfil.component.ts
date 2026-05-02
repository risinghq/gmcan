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
import { ActivatedRoute, Router } from "@angular/router";
import { createMemberFull } from "@app/shared/models/factories";
import type { MemberFull } from "@app/shared/models/member";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService, type MemberUpdateBody } from "@app/shared/services/member.service";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-perfil",
  templateUrl: "./perfil.component.html",
  styleUrl: "./perfil.component.scss",
  providers: [provideNativeDateAdapter()],
  imports: [
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
    MatIcon,
    AutosizeModule,
  ],
})
export default class PerfilComponent implements OnInit {
  formBuilder = inject(FormBuilder);
  private memberService = inject(MemberService);
  private authService = inject(AuthService);
  lookup = inject(LookupService);
  private snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);
  private commonService = inject(CommonService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  url: string;
  member: MemberFull & { birthDateObj?: Date };
  public memberForm: FormGroup;
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

  constructor() {
    this.memberForm = this.formBuilder.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      maternalName: [""],
      birthDate: [""],
      email: ["", Validators.required],
      genderId: [""],
      prefixId: [""],
      memberTypeId: ["", Validators.required],
      dni: ["", Validators.required],
    });
    this.member = { ...createMemberFull() };
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    const user = this.authService.getUser();
    if (!user?.id) {
      return;
    }
    this.memberService.getMemberFull(user.id).subscribe((result: MemberFull) => {
      if (result) {
        this.memberForm.controls["dni"].disable();
        this.member = { ...result };
        if (result.birthDate) {
          const d = new Date(result.birthDate);
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          this.member.birthDateObj = d;
        }
      }
    });
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.returnValue = false;
  }

  actualizarUsuario(): void {
    if (this.memberForm.valid) {
      const body: MemberUpdateBody = {
        email: this.member.email,
        firstName: this.member.firstName,
        lastName: this.member.lastName,
        maternalName: this.member.maternalName ?? undefined,
        birthDate: this.member.birthDateObj ? new Date(this.member.birthDateObj).toLocaleDateString("sv") : undefined,
        bio: this.member.bio ?? undefined,
        bioEN: this.member.bioEN ?? undefined,
        status: this.member.status,
        roleId: this.member.roleId,
        memberTypeId: this.member.memberTypeId,
        prefixId: this.member.prefixId ?? undefined,
        genderId: this.member.genderId ?? undefined,
      };

      this.memberService.updateMember(this.member.id, body).subscribe((result) => {
        if (result.status === 1) {
          if (this.fileData) {
            this.memberService.uploadPhoto(this.member.id, this.fileData).subscribe();
          }
          this.commonService.setReset(true);
          this.openSnackBar("Información actualizada exitosamente", undefined);
          this.getUser();
        }
      });
    }
  }

  fileData: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
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
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

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
