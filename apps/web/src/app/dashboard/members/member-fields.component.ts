import { ChangeDetectionStrategy, Component, inject, input, output } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatOption, provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from "@angular/material/datepicker";
import { MatFormField, MatSuffix } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatSelect } from "@angular/material/select";
import { ImageFieldComponent } from "@app/shared/components/image-field/image-field.component";
import { CONTENT_LOCALES, localeLabel } from "@app/shared/forms/locale-form";
import { LookupService } from "@app/shared/services/lookup.service";

import { BIO_MAX, type ProfileForm } from "./member-form";

/** Fields only an administrator sets are projected below the profile fields. */
@Component({
  selector: "app-member-fields",
  imports: [
    ReactiveFormsModule,
    ImageFieldComponent,
    MatFormField,
    MatSuffix,
    MatInput,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSelect,
    MatOption,
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./member-fields.component.scss",
  template: `
    <div [formGroup]="form()">
      <div class="flex-news mt-24">
        <div class="full-width">
          <div class="flex-news mb-8">
            <div class="mr-32 full-width">
              <label class="text-category" for="member-first-name">
                Primer nombre <span class="red-text">*</span>
              </label>
              <input id="member-first-name" formControlName="firstName" class="input-category" />
            </div>
            <div class="full-width">
              <label class="text-category" for="member-middle-name">Segundo nombre</label>
              <input id="member-middle-name" formControlName="middleName" class="input-category" />
            </div>
          </div>
          <div class="flex-news mb-8">
            <div class="mr-32 full-width">
              <label class="text-category" for="member-last-name">
                Apellido paterno <span class="red-text">*</span>
              </label>
              <input id="member-last-name" formControlName="lastName" class="input-category" />
            </div>
            <div class="full-width">
              <label class="text-category" for="member-maternal-name">Apellido materno</label>
              <input id="member-maternal-name" formControlName="maternalName" class="input-category" />
            </div>
          </div>
          <div class="flex-news mb-8">
            <div class="mr-32 full-width">
              <label class="text-category" for="member-birth-date">Fecha de nacimiento</label>
              <mat-form-field class="form-field">
                <input id="member-birth-date" matInput [matDatepicker]="birth" formControlName="birthDate" />
                <mat-datepicker-toggle matSuffix [for]="birth" />
                <mat-datepicker #birth />
              </mat-form-field>
            </div>
            <div class="full-width">
              <label class="text-category" for="member-email">
                Correo electrónico <span class="red-text">*</span>
              </label>
              <input
                id="member-email"
                type="email"
                formControlName="email"
                class="input-category"
                [class.invalid-error]="emailTaken()"
              />
            </div>
          </div>
          <div class="flex-news mb-8">
            <div class="mr-32 full-width">
              <div class="text-category" id="member-gender-label">Género</div>
              <mat-form-field class="form-field">
                <mat-select formControlName="genderCode" aria-labelledby="member-gender-label">
                  @for (gender of lookup.genders(); track gender.code) {
                    <mat-option [value]="gender.code">{{ gender.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            <div class="full-width">
              <div class="text-category" id="member-prefix-label">Máximo nivel académico alcanzado</div>
              <mat-form-field class="form-field">
                <mat-select formControlName="prefixCode" aria-labelledby="member-prefix-label">
                  @for (prefix of lookup.prefixes(); track prefix.code) {
                    <mat-option [value]="prefix.code">{{ prefix.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>
          <ng-content />
        </div>
        <div class="ml-24">
          <app-image-field label="Imagen de perfil" [current]="photoUrl()" (picked)="photo.emit($event)" />
        </div>
      </div>
      <div formGroupName="translations">
        @for (locale of locales; track locale) {
          <div class="locale-section full-width" [formGroupName]="locale">
            <div class="field-head">
              <label class="text-category" [for]="locale + '-bio'">Resumen profesional · {{ label(locale) }}</label>
              <span class="field-count"
                >{{ form().controls.translations.controls[locale]?.value?.bio?.length ?? 0 }}/{{ bioMax }}</span
              >
            </div>
            <textarea
              [id]="locale + '-bio'"
              formControlName="bio"
              class="input-category"
              [maxlength]="bioMax"
            ></textarea>
          </div>
        }
      </div>
    </div>
  `,
})
export class MemberFieldsComponent {
  readonly form = input.required<ProfileForm>();
  readonly photoUrl = input<string | null>(null);
  readonly emailTaken = input(false);
  readonly photo = output<File>();

  readonly lookup = inject(LookupService);
  readonly locales = CONTENT_LOCALES;
  readonly label = localeLabel;
  readonly bioMax = BIO_MAX;
}
