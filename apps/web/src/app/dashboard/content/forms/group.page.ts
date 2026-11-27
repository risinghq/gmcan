import { ChangeDetectionStrategy, Component, type OnInit, inject, input, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ImageFieldComponent } from "@app/shared/components/image-field/image-field.component";
import { RichTextEditorComponent } from "@app/shared/components/rich-text-editor/rich-text-editor.component";
import { CONTENT_LOCALES, localeForm, localeLabel } from "@app/shared/forms/locale-form";
import type { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GroupService } from "@app/shared/services/group.service";
import type { AdminGroup, AssetSlot } from "@gmcan/contracts/admin";
import { firstValueFrom, map } from "rxjs";

import { ContentFormFlow } from "./content-form-flow";
import { ContentFormComponent } from "./content-form.component";
import { type FutureWorkPreview, FutureWorkPreviewDialog } from "./future-work-preview.dialog";
import { optionalText, requiredText } from "./text-fields";

type GroupSlot = AssetSlot<"research_group">;

@Component({
  selector: "app-group-page",
  imports: [ReactiveFormsModule, ContentFormComponent, ImageFieldComponent, RichTextEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./content-form.scss",
  template: `
    <app-content-form
      saveLabel="Guardar cambios"
      [deleteLabel]="null"
      [canSave]="valid() && !saving()"
      [busy]="saving()"
      (save)="save()"
    >
      <form [formGroup]="form" class="mt-24">
        <div class="flex-news mb-24">
          <app-image-field label="Logo del grupo" [current]="group().assets.header" (picked)="pick('header', $event)" />
          <app-image-field
            label="Logo en negativo"
            [current]="group().assets.footer"
            (picked)="pick('footer', $event)"
          />
          <app-image-field
            label="Imagen del laboratorio"
            [current]="group().assets.facilities"
            (picked)="pick('facilities', $event)"
          />
        </div>
        <div class="flex-news">
          <div class="full-width mb-24 mr-32">
            <div class="text-category">Correo del grupo</div>
            <input class="input-category" type="email" formControlName="email" />
          </div>
          <div class="full-width mb-24">
            <div class="text-category">Teléfono del grupo</div>
            <input class="input-category" formControlName="phone" />
          </div>
        </div>
        @for (locale of locales; track locale) {
          <div class="locale-section full-width" [formGroup]="form.controls.translations.controls[locale]!">
            <div class="locale-title">{{ label(locale) }}</div>
            <div class="text-category">Presentación del grupo <span class="red-text">*</span></div>
            <textarea class="input-category" formControlName="summary"></textarea>
            <div class="text-category">Facilidades y recursos</div>
            <textarea class="input-category" formControlName="facilities"></textarea>
            <div class="field-head">
              <div class="text-category">Trabajos futuros</div>
              <button type="button" class="field-action" (click)="preview(locale)">Vista previa</button>
            </div>
            <app-rich-text-editor formControlName="futureWork" />
            <div class="text-category">Sección Publicaciones</div>
            <textarea class="input-category" formControlName="publicationsSection"></textarea>
            <div class="text-category">Sección Proyectos</div>
            <textarea class="input-category" formControlName="projectsSection"></textarea>
          </div>
        }
      </form>
    </app-content-form>
  `,
})
export default class GroupPage implements OnInit, HasUnsavedChanges {
  readonly group = input.required<AdminGroup>();

  private readonly groups = inject(GroupService);
  private readonly flow = inject(ContentFormFlow);
  private readonly dialog = inject(MatDialog);

  readonly locales = CONTENT_LOCALES;
  readonly label = localeLabel;
  readonly form = new FormGroup({
    email: optionalText(),
    phone: optionalText(),
    translations: localeForm(() => ({
      summary: requiredText(),
      facilities: optionalText(),
      futureWork: optionalText(),
      publicationsSection: optionalText(),
      projectsSection: optionalText(),
    })),
  });
  readonly valid = toSignal(this.form.statusChanges.pipe(map((status) => status === "VALID")), {
    initialValue: false,
  });
  readonly saving = signal(false);
  private readonly images = new Map<GroupSlot, File>();

  ngOnInit(): void {
    const { email, phone, translations } = this.group();
    this.form.patchValue({ email, phone, translations });
    this.form.updateValueAndValidity();
  }

  isDirty(): boolean {
    return this.form.dirty || this.images.size > 0;
  }

  pick(slot: GroupSlot, file: File): void {
    this.images.set(slot, file);
  }

  preview(locale: string): void {
    const data: FutureWorkPreview = { futureWork: this.form.getRawValue().translations[locale]?.futureWork ?? "" };
    this.dialog.open(FutureWorkPreviewDialog, { width: "871px", data });
  }

  save(): Promise<void> {
    const id = this.group().id;
    return this.flow.run(
      this.saving,
      async () => {
        await firstValueFrom(this.groups.updateGroup(id, this.form.getRawValue()));
        await Promise.all(
          [...this.images].map(async ([slot, file]) => {
            await firstValueFrom(this.groups.uploadAsset(id, slot, file));
            this.images.delete(slot);
          }),
        );
        this.form.markAsPristine();
      },
      "Grupo actualizado",
      "No se pudo guardar el grupo",
    );
  }
}
