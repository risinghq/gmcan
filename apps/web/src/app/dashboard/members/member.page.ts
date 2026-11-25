import { ChangeDetectionStrategy, Component, type OnInit, computed, inject, input, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  type AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from "@angular/forms";
import { MatOption } from "@angular/material/core";
import { MatFormField } from "@angular/material/form-field";
import { MatSelect } from "@angular/material/select";
import { PublishabilityChipComponent } from "@app/shared/member-publishability/chip.component";
import type { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { AssetService } from "@app/shared/services/asset.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import type { AdminMember, MemberWrite } from "@gmcan/contracts/admin";
import type { MemberTypeCode, RoleCode } from "@gmcan/contracts/public";
import { firstValueFrom, map } from "rxjs";

import { ContentFormFlow } from "../content/forms/content-form-flow";
import { ContentFormComponent } from "../content/forms/content-form.component";
import { RecordSave } from "../content/forms/record-save";
import { requiredText } from "../content/forms/text-fields";
import { MemberFieldsComponent } from "./member-fields.component";
import { profileForm, profileValue, toProfileWrite } from "./member-form";

const MIN_PASSWORD = 8;

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const { password, confirmPassword } = group.value as { password?: string; confirmPassword?: string };
  return password === confirmPassword ? null : { passwordMismatch: true };
}

function memberForm() {
  return new FormGroup({
    profile: profileForm(),
    memberTypeCode: new FormControl<MemberTypeCode | null>(null, Validators.required),
    dni: requiredText(),
    roleCode: new FormControl<RoleCode>("researcher", { nonNullable: true }),
    isActive: new FormControl<0 | 1>(1, { nonNullable: true }),
    credentials: new FormGroup(
      {
        password: new FormControl("", {
          nonNullable: true,
          validators: [Validators.required, Validators.minLength(MIN_PASSWORD)],
        }),
        confirmPassword: new FormControl("", { nonNullable: true }),
      },
      { validators: passwordsMatch },
    ),
  });
}

type MemberFormValue = ReturnType<ReturnType<typeof memberForm>["getRawValue"]>;

function toMemberWrite(value: MemberFormValue): MemberWrite {
  if (!value.memberTypeCode) throw new Error("The member form is incomplete");
  return {
    ...toProfileWrite(value.profile),
    memberTypeCode: value.memberTypeCode,
    roleCode: value.roleCode,
    isActive: value.isActive,
  };
}

function listPath(isActive: 0 | 1): string {
  return isActive ? "/dashboard/miembros-activos" : "/dashboard/miembros-antiguos";
}

@Component({
  selector: "app-member-page",
  imports: [
    ReactiveFormsModule,
    ContentFormComponent,
    MemberFieldsComponent,
    PublishabilityChipComponent,
    MatFormField,
    MatSelect,
    MatOption,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "../content/forms/content-form.scss",
  template: `
    <app-content-form
      [backTo]="backTo()"
      [saveLabel]="item() ? 'Actualizar información' : 'Registrar nuevo miembro'"
      [deleteLabel]="item() ? 'Eliminar miembro del grupo' : null"
      [canSave]="valid() && !saving()"
      [busy]="saving()"
      (save)="save()"
      (remove)="remove()"
    >
      @if (item(); as member) {
        <div class="mt-16">
          <app-publishability-chip [memberId]="member.id" [memberName]="member.firstName + ' ' + member.lastName" />
        </div>
      }
      <form [formGroup]="form" class="mb-32">
        <app-member-fields
          [form]="form.controls.profile"
          [photoUrl]="item()?.photoUrl ?? null"
          [emailTaken]="emailTaken()"
          (photo)="image.set($event)"
        >
          <div class="flex-news mb-8">
            <div class="mr-32 full-width">
              <div class="text-category">Cargo <span class="red-text">*</span></div>
              <mat-form-field class="input-category">
                <mat-select formControlName="memberTypeCode">
                  @for (type of lookup.memberTypes(); track type.code) {
                    <mat-option [value]="type.code">{{ type.nameSingular }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            <div class="full-width">
              <div class="text-category">N° DNI / Pasaporte <span class="red-text">*</span></div>
              <input formControlName="dni" class="input-category" placeholder="Insertar DNI/Pasaporte" />
            </div>
          </div>
          @if (!item()) {
            <div class="flex-news mb-8" formGroupName="credentials">
              <div class="mr-32 full-width">
                <div class="text-category">
                  Contraseña (mínimo {{ minPassword }} caracteres) <span class="red-text">*</span>
                </div>
                <input type="password" formControlName="password" class="input-category" autocomplete="new-password" />
              </div>
              <div class="full-width">
                <div class="text-category">Repetir contraseña <span class="red-text">*</span></div>
                <input
                  type="password"
                  formControlName="confirmPassword"
                  class="input-category"
                  autocomplete="new-password"
                  [class.invalid-error]="form.controls.credentials.hasError('passwordMismatch')"
                />
              </div>
            </div>
          }
        </app-member-fields>
        <div class="full-width mb-16">
          <div class="text-category">
            ¿Coordinador? Tendrá acceso para manejar permisos de otros coordinadores, gestionar miembros y visualizar
            analíticas
          </div>
          <div class="boxed">
            <input type="radio" id="coordNo" formControlName="roleCode" value="researcher" />
            <label class="mr-16" for="coordNo">No</label>
            <input type="radio" id="coordYes" formControlName="roleCode" value="administrator" />
            <label for="coordYes">Sí</label>
          </div>
        </div>
        <div class="full-width mb-16">
          <div class="text-category">¿Miembro antiguo? (Ex-miembro)</div>
          <div class="boxed">
            <input type="radio" id="formerNo" formControlName="isActive" [value]="1" />
            <label class="mr-16" for="formerNo">No</label>
            <input type="radio" id="formerYes" formControlName="isActive" [value]="0" />
            <label for="formerYes">Sí</label>
          </div>
        </div>
      </form>
    </app-content-form>
  `,
})
export default class MemberPage implements OnInit, HasUnsavedChanges {
  readonly item = input<AdminMember | null>(null);
  readonly returnTo = input<string>();

  private readonly members = inject(MemberService);
  private readonly assets = inject(AssetService);
  private readonly flow = inject(ContentFormFlow);
  readonly lookup = inject(LookupService);

  readonly minPassword = MIN_PASSWORD;
  readonly form = memberForm();
  readonly valid = toSignal(this.form.statusChanges.pipe(map((status) => status === "VALID")), {
    initialValue: false,
  });
  readonly backTo = computed(() =>
    this.returnTo() === "miembros-antiguos" ? listPath(0) : listPath(this.item()?.isActive ?? 1),
  );
  readonly image = signal<File | null>(null);
  readonly emailTaken = signal(false);
  readonly saving = signal(false);
  private record = new RecordSave(null);

  ngOnInit(): void {
    const item = this.item();
    this.record = new RecordSave(item?.id ?? null);
    if (item) {
      this.form.patchValue({ ...item, profile: profileValue(item) });
      this.form.controls.dni.disable();
      this.form.controls.credentials.disable();
    }
    this.form.updateValueAndValidity();
  }

  isDirty(): boolean {
    return this.form.dirty || this.image() !== null;
  }

  async save(): Promise<void> {
    const value = this.form.getRawValue();
    const body = toMemberWrite(value);
    if (!(await this.emailFree(body.email))) return;
    await this.flow.run(
      this.saving,
      async () => {
        const id = await this.record.write(
          () => this.members.createMember({ ...body, dni: value.dni, password: value.credentials.password }),
          (savedId) => this.members.updateMember(savedId, body),
        );
        const image = this.image();
        if (image) await firstValueFrom(this.assets.put({ ownerType: "member", ownerId: id, slot: "photo" }, image));
        this.settle();
      },
      this.item() ? "Miembro actualizado" : "Miembro registrado",
      "No se pudo guardar el miembro",
      listPath(body.isActive),
    );
  }

  async remove(): Promise<void> {
    const id = this.record.savedId;
    if (id === null) return;
    if (
      !(await this.flow.confirmDelete(
        "Eliminar miembro",
        "¿Estás seguro que deseas eliminar a este miembro del grupo?",
      ))
    )
      return;
    await this.flow.run(
      this.saving,
      async () => {
        await firstValueFrom(this.members.deleteMember(id));
        this.settle();
      },
      "Miembro eliminado",
      "No se pudo eliminar el miembro",
      this.backTo(),
    );
  }

  /** The member's own email does not count as taken. */
  private async emailFree(email: string): Promise<boolean> {
    if (email === this.item()?.email) return true;
    let exists: boolean;
    try {
      ({ exists } = await firstValueFrom(this.members.verifyEmail(email)));
    } catch {
      this.flow.notify("No se pudo verificar el correo");
      return false;
    }
    this.emailTaken.set(exists);
    if (exists) this.flow.notify("Este correo ya pertenece a otro miembro");
    return !exists;
  }

  private settle(): void {
    this.form.markAsPristine();
    this.image.set(null);
  }
}
