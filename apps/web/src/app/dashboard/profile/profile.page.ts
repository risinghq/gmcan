import {
  ChangeDetectionStrategy,
  Component,
  type OnInit,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  type AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from "@angular/forms";
import { toNavigationAppError } from "@app/shared/errors/app-error";
import { PublishabilityChipComponent } from "@app/shared/member-publishability/chip.component";
import type { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { AuthService } from "@app/shared/services/auth.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import type { AdminMember } from "@gmcan/contracts/admin";
import { firstValueFrom, map } from "rxjs";

import { ContentFormFlow } from "../content/forms/content-form-flow";
import { MemberFieldsComponent } from "../members/member-fields.component";
import { profileForm, profileValue, toProfileWrite } from "../members/member-form";

const MIN_PASSWORD = 8;

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const { password, confirmPassword } = group.value as { password?: string; confirmPassword?: string };
  return password === confirmPassword ? null : { passwordMismatch: true };
}

function passwordForm() {
  return new FormGroup(
    {
      password: new FormControl("", {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(MIN_PASSWORD)],
      }),
      confirmPassword: new FormControl("", { nonNullable: true }),
    },
    { validators: passwordsMatch },
  );
}

@Component({
  selector: "app-profile-page",
  imports: [ReactiveFormsModule, MemberFieldsComponent, PublishabilityChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "../content/forms/content-form.scss",
  template: `
    <div class="pad">
      <div class="add-box">
        <div class="form-head">
          <app-publishability-chip
            [memberId]="item().id"
            [memberName]="item().firstName + ' ' + item().lastName"
            [own]="true"
          />
          <div class="right obligatory-text"><span class="red-text">(*) </span>Campos obligatorios</div>
        </div>
        <form [formGroup]="form" class="mb-32">
          <app-member-fields
            [form]="form"
            [photoUrl]="item().photoUrl"
            [emailTaken]="emailTaken()"
            (photo)="image.set($event)"
          >
            <div class="flex-news mb-8">
              <div class="mr-32 full-width">
                <div class="text-category">Cargo</div>
                <div class="input-category" data-testid="member-type">{{ memberType() }}</div>
              </div>
              <div class="full-width">
                <div class="text-category">N° DNI / Pasaporte</div>
                <div class="input-category" data-testid="dni">{{ item().dni }}</div>
              </div>
            </div>
          </app-member-fields>
        </form>
        <div class="flex-news mb-32">
          <button type="button" class="right btn-black" [disabled]="!canSave()" (click)="save()">
            <span class="link link-set">Actualizar información</span>
          </button>
        </div>
        <form [formGroup]="password">
          <div class="text-category mb-8">Cambiar contraseña</div>
          <div class="flex-news mb-8">
            <div class="mr-32 full-width">
              <div class="text-category">
                Nueva contraseña (mínimo {{ minPassword }} caracteres) <span class="red-text">*</span>
              </div>
              <input type="password" formControlName="password" class="input-category" autocomplete="new-password" />
            </div>
            <div class="full-width">
              <div class="text-category">Confirmar nueva contraseña <span class="red-text">*</span></div>
              <input
                type="password"
                formControlName="confirmPassword"
                class="input-category"
                autocomplete="new-password"
                [class.invalid-error]="password.hasError('passwordMismatch') && password.controls.confirmPassword.dirty"
              />
            </div>
          </div>
        </form>
        <div class="flex-news">
          <button type="button" class="right btn-black" [disabled]="!canChangePassword()" (click)="changePassword()">
            <span class="link link-set">Actualizar contraseña</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export default class ProfilePage implements OnInit, HasUnsavedChanges {
  readonly item = input.required<AdminMember>();

  private readonly members = inject(MemberService);
  private readonly auth = inject(AuthService);
  private readonly flow = inject(ContentFormFlow);
  private readonly lookup = inject(LookupService);
  private readonly chip = viewChild.required(PublishabilityChipComponent);

  readonly minPassword = MIN_PASSWORD;
  readonly form = profileForm();
  readonly password = passwordForm();
  readonly image = signal<File | null>(null);
  readonly emailTaken = signal(false);
  readonly saving = signal(false);

  private readonly valid = toSignal(this.form.statusChanges.pipe(map((status) => status === "VALID")), {
    initialValue: false,
  });
  private readonly passwordValid = toSignal(this.password.statusChanges.pipe(map((status) => status === "VALID")), {
    initialValue: false,
  });
  readonly canSave = computed(() => this.valid() && !this.saving());
  readonly canChangePassword = computed(() => this.passwordValid() && !this.saving());
  readonly memberType = computed(
    () => this.lookup.memberTypes().find((type) => type.code === this.item().memberTypeCode)?.nameSingular ?? "",
  );

  ngOnInit(): void {
    this.form.setValue(profileValue(this.item()));
    this.form.updateValueAndValidity();
  }

  isDirty(): boolean {
    return this.form.dirty || this.image() !== null || this.password.dirty;
  }

  async save(): Promise<void> {
    this.saving.set(true);
    try {
      await firstValueFrom(this.members.updateOwnProfile(toProfileWrite(this.form.getRawValue())));
      const image = this.image();
      if (image) await firstValueFrom(this.members.uploadOwnPhoto(image));
      this.form.markAsPristine();
      this.image.set(null);
      this.emailTaken.set(false);
      await firstValueFrom(this.auth.fetchCurrentUser());
      this.chip().refresh();
      this.flow.notify("Información actualizada");
    } catch (error) {
      this.saveFailed(error);
    } finally {
      this.saving.set(false);
    }
  }

  async changePassword(): Promise<void> {
    this.saving.set(true);
    try {
      await firstValueFrom(this.auth.updateMyPassword({ newPassword: this.password.getRawValue().password }));
      this.password.reset();
      this.flow.notify("Contraseña actualizada");
    } catch {
      this.flow.notify("No se pudo actualizar la contraseña");
    } finally {
      this.saving.set(false);
    }
  }

  /** The email is the only unique field a member edits, so a conflict means another member holds it. */
  private saveFailed(error: unknown): void {
    const taken = toNavigationAppError(error).code === "conflict";
    this.emailTaken.set(taken);
    this.flow.notify(taken ? "Este correo ya pertenece a otro miembro" : "No se pudo actualizar el perfil");
  }
}
