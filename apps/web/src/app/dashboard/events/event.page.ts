import { ChangeDetectionStrategy, Component, type OnInit, inject, input, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule } from "@angular/forms";
import { CONTENT_LOCALES, localeForm, localeLabel } from "@app/shared/forms/locale-form";
import type { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { type AdminEvent, type EventTranslation, EventService } from "@app/shared/services/event.service";
import type { Translations } from "@gmcan/contracts/admin";
import { firstValueFrom, map } from "rxjs";

import { ContentFormFlow } from "../content/forms/content-form-flow";
import { ContentFormComponent } from "../content/forms/content-form.component";
import { RecordSave } from "../content/forms/record-save";
import { optionalText, requiredText } from "../content/forms/text-fields";

const EVENT_LIST = "/dashboard/eventos";

type EventFields = { name: string; city: string; country: string };

/** The API stores a blank city or country as null. */
function toTranslations(value: Translations<EventFields>): Translations<EventTranslation> {
  return Object.fromEntries(
    Object.entries(value).map(([locale, { name, city, country }]) => [
      locale,
      { name: name.trim(), city: city.trim() || null, country: country.trim() || null },
    ]),
  );
}

@Component({
  selector: "app-event-page",
  imports: [ReactiveFormsModule, ContentFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "../content/forms/content-form.scss",
  template: `
    <app-content-form
      backTo="/dashboard/eventos"
      [saveLabel]="item() ? 'Actualizar evento' : 'Guardar evento'"
      [deleteLabel]="item() ? 'Eliminar evento' : null"
      [canSave]="valid() && !saving()"
      [busy]="saving()"
      (save)="save()"
      (remove)="remove()"
    >
      <form [formGroup]="form" class="mt-24 mb-32">
        @for (locale of locales; track locale) {
          <div class="locale-section full-width" [formGroupName]="locale">
            <div class="locale-title">{{ label(locale) }}</div>
            <div class="text-category">Nombre oficial del evento <span class="red-text">*</span></div>
            <input class="input-category" formControlName="name" placeholder="Ingresar nombre" />
            <div class="flex-news mt-8">
              <div class="mr-32 full-width">
                <div class="text-category">País</div>
                <input class="input-category" formControlName="country" placeholder="Ingresar país" />
              </div>
              <div class="full-width">
                <div class="text-category">Ciudad</div>
                <input class="input-category" formControlName="city" placeholder="Ingresar ciudad" />
              </div>
            </div>
          </div>
        }
      </form>
    </app-content-form>
  `,
})
export default class EventPage implements OnInit, HasUnsavedChanges {
  readonly item = input<AdminEvent | null>(null);

  private readonly events = inject(EventService);
  private readonly flow = inject(ContentFormFlow);

  readonly locales = CONTENT_LOCALES;
  readonly label = localeLabel;
  readonly form = localeForm(() => ({ name: requiredText(), city: optionalText(), country: optionalText() }));
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
    const body = { translations: toTranslations(this.form.getRawValue()) };
    return this.flow.run(
      this.saving,
      async () => {
        await this.record.write(
          () => this.events.create(body),
          (id) => this.events.update(id, body),
        );
        this.form.markAsPristine();
      },
      this.item() ? "Evento actualizado" : "Evento agregado",
      "No se pudo guardar el evento",
      EVENT_LIST,
    );
  }

  async remove(): Promise<void> {
    const id = this.record.savedId;
    if (id === null) return;
    if (!(await this.flow.confirmDelete("Eliminar evento", "¿Estás seguro que deseas eliminar este evento?"))) return;
    await this.flow.run(
      this.saving,
      async () => {
        await firstValueFrom(this.events.delete(id));
        this.form.markAsPristine();
      },
      "Evento eliminado",
      "No se pudo eliminar el evento",
      EVENT_LIST,
    );
  }
}
