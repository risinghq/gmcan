import { ChangeDetectionStrategy, Component, type OnInit, inject, input, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule } from "@angular/forms";
import { CONTENT_LOCALES, localeForm, localeLabel } from "@app/shared/forms/locale-form";
import type { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { type AdminUniversity, RefService } from "@app/shared/services/ref.service";
import { firstValueFrom, map } from "rxjs";

import { ContentFormFlow } from "../content/forms/content-form-flow";
import { ContentFormComponent } from "../content/forms/content-form.component";
import { RecordSave } from "../content/forms/record-save";
import { requiredText } from "../content/forms/text-fields";

const UNIVERSITY_LIST = "/dashboard/tesis";

@Component({
  selector: "app-university-page",
  imports: [ReactiveFormsModule, ContentFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "../content/forms/content-form.scss",
  template: `
    <app-content-form
      backTo="/dashboard/tesis"
      [saveLabel]="item() ? 'Actualizar universidad' : 'Guardar universidad'"
      [deleteLabel]="item() ? 'Eliminar universidad' : null"
      [canSave]="valid() && !saving()"
      [busy]="saving()"
      (save)="save()"
      (remove)="remove()"
    >
      <form [formGroup]="form" class="mt-24 mb-32">
        @for (locale of locales; track locale) {
          <div class="locale-section full-width" [formGroupName]="locale">
            <div class="locale-title">{{ label(locale) }}</div>
            <div class="text-category">Nombre oficial de la universidad <span class="red-text">*</span></div>
            <input class="input-category" formControlName="name" placeholder="Ingresar nombre" />
          </div>
        }
      </form>
    </app-content-form>
  `,
})
export default class UniversityPage implements OnInit, HasUnsavedChanges {
  readonly item = input<AdminUniversity | null>(null);

  private readonly refs = inject(RefService);
  private readonly flow = inject(ContentFormFlow);

  readonly locales = CONTENT_LOCALES;
  readonly label = localeLabel;
  readonly form = localeForm(() => ({ name: requiredText() }));
  readonly valid = toSignal(this.form.statusChanges.pipe(map((status) => status === "VALID")), {
    initialValue: false,
  });
  readonly saving = signal(false);
  private record = new RecordSave(null);

  ngOnInit(): void {
    const item = this.item();
    this.record = new RecordSave(item?.id ?? null);
    if (item) this.form.patchValue(item.translations);
    this.form.updateValueAndValidity();
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  save(): Promise<void> {
    const body = { translations: this.form.getRawValue() };
    return this.flow.run(
      this.saving,
      async () => {
        await this.record.write(
          () => this.refs.createUniversity(body),
          (id) => this.refs.updateUniversity(id, body),
        );
        this.form.markAsPristine();
      },
      this.item() ? "Universidad actualizada" : "Universidad agregada",
      "No se pudo guardar la universidad",
      UNIVERSITY_LIST,
    );
  }

  async remove(): Promise<void> {
    const id = this.record.savedId;
    if (id === null) return;
    if (!(await this.flow.confirmDelete("Eliminar universidad", "¿Estás seguro que deseas eliminar esta universidad?")))
      return;
    await this.flow.run(
      this.saving,
      async () => {
        await firstValueFrom(this.refs.deleteUniversity(id));
        this.form.markAsPristine();
      },
      "Universidad eliminada",
      "No se pudo eliminar la universidad",
      UNIVERSITY_LIST,
    );
  }
}
