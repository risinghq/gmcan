import { ChangeDetectionStrategy, Component, type OnInit, inject, input, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule } from "@angular/forms";
import { ImageFieldComponent } from "@app/shared/components/image-field/image-field.component";
import { CONTENT_LOCALES, localeForm, localeLabel } from "@app/shared/forms/locale-form";
import type { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { AssetService } from "@app/shared/services/asset.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import type { AdminResearchLine } from "@gmcan/contracts/admin";
import { firstValueFrom, map } from "rxjs";

import { ContentFormFlow } from "./content-form-flow";
import { ContentFormComponent } from "./content-form.component";
import { RecordSave } from "./record-save";
import { optionalText, requiredText } from "./text-fields";

@Component({
  selector: "app-research-line-page",
  imports: [ReactiveFormsModule, ContentFormComponent, ImageFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./content-form.scss",
  template: `
    <app-content-form
      [saveLabel]="item() ? 'Guardar cambios' : 'Guardar línea'"
      [deleteLabel]="item() ? 'Eliminar línea' : null"
      [canSave]="valid() && !saving()"
      [busy]="saving()"
      (save)="save()"
      (remove)="remove()"
    >
      <form [formGroup]="form" class="mt-24">
        <div class="flex-news full-width">
          <div class="full-width mr-32">
            @for (locale of locales; track locale) {
              <div class="locale-section" [formGroupName]="locale">
                <div class="locale-title">{{ label(locale) }}</div>
                <div class="text-category">Nombre de línea <span class="red-text">*</span></div>
                <input class="input-category" formControlName="name" />
                <div class="text-category">Descripción</div>
                <textarea class="input-category" formControlName="description"></textarea>
              </div>
            }
          </div>
          <app-image-field [current]="item()?.asset ?? null" (picked)="image.set($event)" />
        </div>
      </form>
    </app-content-form>
  `,
})
export default class ResearchLinePage implements OnInit, HasUnsavedChanges {
  readonly item = input<AdminResearchLine | null>(null);
  readonly groupId = input.required<number>();

  private readonly lines = inject(ResearchLinesService);
  private readonly assets = inject(AssetService);
  private readonly flow = inject(ContentFormFlow);

  readonly locales = CONTENT_LOCALES;
  readonly label = localeLabel;
  readonly form = localeForm(() => ({ name: requiredText(), description: optionalText() }));
  readonly valid = toSignal(this.form.statusChanges.pipe(map((status) => status === "VALID")), {
    initialValue: false,
  });
  readonly image = signal<File | null>(null);
  readonly saving = signal(false);
  private record = new RecordSave(null);

  ngOnInit(): void {
    const item = this.item();
    this.record = new RecordSave(item?.id ?? null);
    if (item) this.form.patchValue(item.translations);
    this.form.updateValueAndValidity();
  }

  isDirty(): boolean {
    return this.form.dirty || this.image() !== null;
  }

  save(): Promise<void> {
    const editing = this.item() !== null;
    return this.flow.run(
      this.saving,
      async () => {
        const translations = this.form.getRawValue();
        const id = await this.record.write(
          () => this.lines.create({ translations, groupId: this.groupId() }),
          (savedId) => this.lines.update(savedId, { translations }),
        );
        const image = this.image();
        if (image)
          await firstValueFrom(this.assets.put({ ownerType: "research_line", ownerId: id, slot: "photo" }, image));
        this.settle();
      },
      editing ? "Línea de investigación actualizada" : "Línea de investigación agregada",
      "No se pudo guardar la línea de investigación",
    );
  }

  async remove(): Promise<void> {
    const id = this.record.savedId;
    if (id === null) return;
    if (
      !(await this.flow.confirmDelete(
        "Eliminar línea de investigación",
        "¿Estás seguro que deseas eliminar esta línea?",
      ))
    )
      return;
    await this.flow.run(
      this.saving,
      async () => {
        await firstValueFrom(this.lines.delete(id));
        this.settle();
      },
      "Línea de investigación eliminada",
      "No se pudo eliminar la línea de investigación",
    );
  }

  private settle(): void {
    this.form.markAsPristine();
    this.image.set(null);
  }
}
