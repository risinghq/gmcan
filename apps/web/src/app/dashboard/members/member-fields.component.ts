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
import { AutosizeModule } from "ngx-autosize";

import { BIO_MAX, type ProfileForm } from "./member-form";

/** Fields only an administrator sets are projected below the profile fields. */
@Component({
  selector: "app-member-fields",
  imports: [
    ReactiveFormsModule,
    AutosizeModule,
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
              <div class="text-category">Primer nombre <span class="red-text">*</span></div>
              <input formControlName="firstName" class="input-category" placeholder="Insertar primer nombre" />
            </div>
            <div class="full-width">
              <div class="text-category">Segundo nombre</div>
              <input formControlName="middleName" class="input-category" placeholder="Insertar segundo nombre" />
            </div>
          </div>
          <div class="flex-news mb-8">
            <div class="mr-32 full-width">
              <div class="text-category">Apellido paterno <span class="red-text">*</span></div>
              <input formControlName="lastName" class="input-category" placeholder="Insertar apellido paterno" />
            </div>
            <div class="full-width">
              <div class="text-category">Apellido materno</div>
              <input formControlName="maternalName" class="input-category" placeholder="Insertar apellido materno" />
            </div>
          </div>
          <div class="flex-news mb-8">
            <div class="mr-32 full-width">
              <div class="text-category">Fecha de nacimiento</div>
              <mat-form-field class="input-category">
                <input matInput [matDatepicker]="birth" formControlName="birthDate" />
                <mat-datepicker-toggle matSuffix [for]="birth" />
                <mat-datepicker #birth />
              </mat-form-field>
            </div>
            <div class="full-width">
              <div class="text-category">Correo electrónico <span class="red-text">*</span></div>
              <input
                type="email"
                formControlName="email"
                class="input-category"
                placeholder="Insertar correo electrónico"
                [class.invalid-error]="emailTaken()"
              />
            </div>
          </div>
          <div class="flex-news mb-8">
            <div class="mr-32 full-width">
              <div class="text-category">Género</div>
              <mat-form-field class="input-category">
                <mat-select formControlName="genderCode">
                  @for (gender of lookup.genders(); track gender.code) {
                    <mat-option [value]="gender.code">{{ gender.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            <div class="full-width">
              <div class="text-category">Máximo nivel académico alcanzado</div>
              <mat-form-field class="input-category">
                <mat-select formControlName="prefixCode">
                  @for (prefix of lookup.prefixes(); track prefix.code) {
                    <mat-option [value]="prefix.code">{{ prefix.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>
          <ng-content />
        </div>
        <div class="ml-24 photo">
          <app-image-field label="Imagen de perfil" [current]="photoUrl()" (picked)="photo.emit($event)" />
        </div>
      </div>
      <div formGroupName="translations">
        @for (locale of locales; track locale) {
          <div class="locale-section full-width" [formGroupName]="locale">
            <div class="text-category">
              Resumen profesional · {{ label(locale) }}
              <span>({{ form().controls.translations.controls[locale]?.value?.bio?.length ?? 0 }}/{{ bioMax }})</span>
            </div>
            <textarea formControlName="bio" autosize class="input-category" [maxlength]="bioMax"></textarea>
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
