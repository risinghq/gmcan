import { ChangeDetectionStrategy, Component, type OnInit, computed, inject, input, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatOption, provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { MatFormField, MatSuffix } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatSelect } from "@angular/material/select";
import { confirmAction } from "@app/shared/forms/confirm-dialog.component";
import { CONTENT_LOCALES, localeForm, localeLabel } from "@app/shared/forms/locale-form";
import type { AdminMemberListItem } from "@app/shared/models/admin-list";
import type { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { LookupService } from "@app/shared/services/lookup.service";
import { ProjectService } from "@app/shared/services/project.service";
import { parseLocalDate, toIsoDate } from "@app/shared/utils/date";
import { toMinorUnits } from "@app/shared/utils/money";
import type { AdminProject, ProjectWrite } from "@gmcan/contracts/admin";
import type { CurrencyCode, FundingSourceCode, ProjectStatusCode } from "@gmcan/contracts/public";
import { firstValueFrom, map } from "rxjs";

import { ContentFormFlow } from "../content/forms/content-form-flow";
import { ContentFormComponent } from "../content/forms/content-form.component";
import { RecordSave } from "../content/forms/record-save";
import { requiredText } from "../content/forms/text-fields";
import type { ResearchLineOption } from "../dashboard.resolvers";
import { isOngoing, projectListPath } from "./project-status";

function fullName(member: AdminMemberListItem): string {
  return [member.firstName, member.lastName, member.maternalName].filter(Boolean).join(" ");
}

function projectForm() {
  return new FormGroup({
    code: requiredText(),
    researchLineId: new FormControl<number | null>(null, Validators.required),
    memberIds: new FormControl<number[]>([], { nonNullable: true, validators: Validators.required }),
    fundingSourceCode: new FormControl<FundingSourceCode | null>(null, Validators.required),
    currencyCode: new FormControl<CurrencyCode | null>(null, Validators.required),
    fundedAmount: new FormControl<number | null>(null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
    startDate: new FormControl<Date | null>(null, Validators.required),
    endDate: new FormControl<Date | null>(null),
    translations: localeForm(() => ({ title: requiredText(), description: requiredText() })),
  });
}

type ProjectFormValue = ReturnType<ReturnType<typeof projectForm>["getRawValue"]>;

/**
 * The required validators guarantee the shared fields. A concluded project without an end date
 * ends today. An ongoing project has none.
 */
function toProjectWrite(value: ProjectFormValue, statusCode: ProjectStatusCode): ProjectWrite {
  const { code, researchLineId, memberIds, fundingSourceCode, currencyCode, fundedAmount, startDate, endDate } = value;
  if (researchLineId === null || !fundingSourceCode || !currencyCode || fundedAmount === null || !startDate) {
    throw new Error("The project form is incomplete");
  }
  return {
    code,
    researchLineId,
    memberIds,
    fundingSourceCode,
    currencyCode,
    fundedAmountMinor: toMinorUnits(Number(fundedAmount)),
    statusCode,
    startDate: toIsoDate(startDate),
    endDate: isOngoing(statusCode) ? null : toIsoDate(endDate ?? new Date()),
    translations: value.translations,
  };
}

@Component({
  selector: "app-project-page",
  imports: [
    ReactiveFormsModule,
    ContentFormComponent,
    MatFormField,
    MatInput,
    MatSuffix,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSelect,
    MatOption,
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ["../content/forms/content-form.scss", "./project.page.scss"],
  template: `
    <app-content-form
      [backTo]="listPath()"
      [saveLabel]="item() ? 'Actualizar información' : 'Guardar proyecto'"
      [deleteLabel]="item() ? 'Eliminar proyecto' : null"
      [canSave]="valid() && !saving()"
      [busy]="saving()"
      (save)="save()"
      (remove)="remove()"
    >
      <form [formGroup]="form" class="mt-24 mb-32">
        <div class="flex-news">
          <div class="mr-32 full-width">
            <div class="text-category">Código <span class="red-text">*</span></div>
            <input class="input-category" formControlName="code" />
          </div>
          <div class="full-width">
            <div class="text-category">Línea de investigación <span class="red-text">*</span></div>
            <mat-form-field class="form-field">
              <mat-select placeholder="Seleccionar línea" formControlName="researchLineId">
                @for (line of researchLines(); track line.id) {
                  <mat-option [value]="line.id">{{ line.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        </div>
        <div class="full-width mt-16">
          <div class="text-category">Responsable(s) <span class="red-text">*</span></div>
          <mat-form-field class="form-field">
            <mat-select placeholder="Seleccionar responsables" formControlName="memberIds" multiple>
              @for (member of sortedMembers(); track member.id) {
                <mat-option [value]="member.id">{{ name(member) }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        <div class="flex-news mt-8">
          <div class="mr-32 full-width">
            <div class="text-category">Fuente de financiamiento <span class="red-text">*</span></div>
            <mat-form-field class="form-field">
              <mat-select placeholder="Seleccionar fuente de financiamiento" formControlName="fundingSourceCode">
                @for (source of fundingSources(); track source.code) {
                  <mat-option [value]="source.code">{{ source.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
          <div class="mr-32 width-128">
            <div class="text-category">Moneda <span class="red-text">*</span></div>
            <mat-form-field class="form-field">
              <mat-select placeholder="Tipo" formControlName="currencyCode">
                @for (currency of currencies(); track currency.code) {
                  <mat-option [value]="currency.code">{{ currency.symbol }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
          <div class="full-width">
            <div class="text-category">Monto financiado <span class="red-text">*</span></div>
            <input class="input-category" type="number" min="0" step="0.01" formControlName="fundedAmount" />
          </div>
        </div>
        <div class="flex-news">
          <div class="width-479 mr-26">
            <div class="text-category">Fecha de inicio <span class="red-text">*</span></div>
            <mat-form-field class="form-field">
              <input
                matInput
                placeholder="Seleccionar fecha de inicio"
                [matDatepicker]="start"
                formControlName="startDate"
              />
              <mat-datepicker-toggle matSuffix [for]="start" />
              <mat-datepicker #start />
            </mat-form-field>
          </div>
          @if (concluded()) {
            <div class="width-479">
              <div class="text-category">Fecha de fin <span class="red-text">*</span></div>
              <mat-form-field class="form-field">
                <input
                  matInput
                  placeholder="Seleccionar fecha de fin"
                  [matDatepicker]="end"
                  formControlName="endDate"
                />
                <mat-datepicker-toggle matSuffix [for]="end" />
                <mat-datepicker #end />
              </mat-form-field>
            </div>
          }
        </div>
        <div formGroupName="translations">
          @for (locale of locales; track locale) {
            <div class="locale-section full-width" [formGroupName]="locale">
              <div class="locale-title">{{ label(locale) }}</div>
              <div class="text-category">Título del proyecto <span class="red-text">*</span></div>
              <input class="input-category" formControlName="title" placeholder="Insertar título del proyecto" />
              <div class="text-category">Descripción <span class="red-text">*</span></div>
              <textarea
                class="input-category"
                formControlName="description"
                placeholder="Insertar descripción"
              ></textarea>
            </div>
          }
        </div>
      </form>
      @if (item()) {
        <div formAction class="mr-16">
          <button type="button" class="link link-set" [disabled]="!valid() || saving()" (click)="toggleConcluded()">
            {{ concluded() ? "Reactivar proyecto" : "Concluir proyecto" }}
          </button>
        </div>
      }
    </app-content-form>
  `,
})
export default class ProjectPage implements OnInit, HasUnsavedChanges {
  readonly item = input<AdminProject | null>(null);
  readonly members = input.required<AdminMemberListItem[]>();
  readonly researchLines = input.required<ResearchLineOption[]>();

  private readonly projects = inject(ProjectService);
  private readonly flow = inject(ContentFormFlow);
  private readonly dialog = inject(MatDialog);
  private readonly lookup = inject(LookupService);

  readonly locales = CONTENT_LOCALES;
  readonly label = localeLabel;
  readonly name = fullName;
  readonly fundingSources = computed(() => this.lookup.fundingSources());
  readonly currencies = computed(() => this.lookup.currencies());
  readonly sortedMembers = computed(() => this.members().toSorted((a, b) => fullName(a).localeCompare(fullName(b))));
  readonly form = projectForm();
  readonly valid = toSignal(this.form.statusChanges.pipe(map((status) => status === "VALID")), {
    initialValue: false,
  });
  readonly status = computed<ProjectStatusCode>(() => this.item()?.statusCode ?? "active");
  readonly concluded = computed(() => !isOngoing(this.status()));
  readonly listPath = computed(() => projectListPath(this.status()));
  readonly saving = signal(false);
  private record = new RecordSave(null);

  ngOnInit(): void {
    const item = this.item();
    this.record = new RecordSave(item?.id ?? null);
    if (item) {
      this.form.patchValue({
        ...item,
        fundedAmount: item.fundedAmountMinor / 100,
        startDate: parseLocalDate(item.startDate) ?? null,
        endDate: item.endDate ? (parseLocalDate(item.endDate) ?? null) : null,
      });
      if (this.concluded()) this.form.controls.endDate.addValidators(Validators.required);
    }
    this.form.updateValueAndValidity();
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  save(): Promise<void> {
    return this.write(this.status(), this.item() ? "Proyecto actualizado" : "Proyecto agregado");
  }

  async toggleConcluded(): Promise<void> {
    const conclude = !this.concluded();
    const confirmed = await confirmAction(this.dialog, {
      title: conclude ? "Concluir proyecto" : "Reactivar proyecto",
      text: conclude
        ? "¿Estás seguro que deseas marcar este proyecto como concluido?"
        : "¿Estás seguro que deseas volver a poner este proyecto en ejecución?",
      confirm: conclude ? "Sí, concluir" : "Sí, reactivar",
      dismiss: "No, cancelar",
    });
    if (!confirmed) return;
    await this.write(conclude ? "completed" : "active", conclude ? "Proyecto concluido" : "Proyecto reactivado");
  }

  async remove(): Promise<void> {
    const id = this.record.savedId;
    if (id === null) return;
    if (!(await this.flow.confirmDelete("Eliminar proyecto", "¿Estás seguro que deseas eliminar este proyecto?"))) {
      return;
    }
    await this.flow.run(
      this.saving,
      async () => {
        await firstValueFrom(this.projects.deleteProject(id));
        this.form.markAsPristine();
      },
      "Proyecto eliminado",
      "No se pudo eliminar el proyecto",
      this.listPath(),
    );
  }

  private write(statusCode: ProjectStatusCode, success: string): Promise<void> {
    return this.flow.run(
      this.saving,
      async () => {
        const body = toProjectWrite(this.form.getRawValue(), statusCode);
        await this.record.write(
          () => this.projects.createProject(body),
          (id) => this.projects.updateProject(id, body),
        );
        this.form.markAsPristine();
      },
      success,
      "No se pudo guardar el proyecto",
      projectListPath(statusCode),
    );
  }
}
