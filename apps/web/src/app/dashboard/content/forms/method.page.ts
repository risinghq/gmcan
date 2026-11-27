import { ChangeDetectionStrategy, Component, DestroyRef, type OnInit, inject, input, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ImageFieldComponent } from "@app/shared/components/image-field/image-field.component";
import { RichTextEditorComponent } from "@app/shared/components/rich-text-editor/rich-text-editor.component";
import { CONTENT_LOCALES, localeForm, localeLabel } from "@app/shared/forms/locale-form";
import type { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { AssetService } from "@app/shared/services/asset.service";
import { MethodsService } from "@app/shared/services/methods.service";
import type { AdminMethod } from "@gmcan/contracts/admin";
import { firstValueFrom, map } from "rxjs";

import { ContentFormFlow } from "./content-form-flow";
import { ContentFormComponent } from "./content-form.component";
import { type MethodPreview, MethodPreviewDialog } from "./method-preview.dialog";
import { RecordSave } from "./record-save";
import { requiredText } from "./text-fields";

@Component({
  selector: "app-method-page",
  imports: [ReactiveFormsModule, ContentFormComponent, ImageFieldComponent, RichTextEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./content-form.scss",
  template: `
    <app-content-form
      [saveLabel]="item() ? 'Guardar cambios' : 'Guardar método'"
      [deleteLabel]="item() ? 'Eliminar método' : null"
      [canSave]="valid() && !saving()"
      [busy]="saving()"
      (save)="save()"
      (remove)="remove()"
    >
      <form [formGroup]="form" class="mt-24">
        <app-image-field [current]="item()?.asset ?? null" (picked)="pick($event)" />
        @for (locale of locales; track locale) {
          <div class="locale-section full-width" [formGroupName]="locale">
            <div class="locale-title">{{ label(locale) }}</div>
            <div class="text-category">Nombre del método <span class="red-text">*</span></div>
            <input class="input-category" formControlName="name" />
            <div class="field-head">
              <div class="text-category">Descripción <span class="red-text">*</span></div>
              <button type="button" class="field-action" (click)="preview(locale)">Vista previa</button>
            </div>
            <app-rich-text-editor formControlName="description" />
          </div>
        }
      </form>
    </app-content-form>
  `,
})
export default class MethodPage implements OnInit, HasUnsavedChanges {
  readonly item = input<AdminMethod | null>(null);
  readonly groupId = input.required<number>();

  private readonly methods = inject(MethodsService);
  private readonly assets = inject(AssetService);
  private readonly flow = inject(ContentFormFlow);
  private readonly dialog = inject(MatDialog);

  readonly locales = CONTENT_LOCALES;
  readonly label = localeLabel;
  readonly form = localeForm(() => ({ name: requiredText(), description: requiredText() }));
  readonly valid = toSignal(this.form.statusChanges.pipe(map((status) => status === "VALID")), {
    initialValue: false,
  });
  readonly image = signal<File | null>(null);
  readonly saving = signal(false);
  private record = new RecordSave(null);
  private imageUrl: string | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.revokeImageUrl());
  }

  ngOnInit(): void {
    const item = this.item();
    this.record = new RecordSave(item?.id ?? null);
    if (item) this.form.patchValue(item.translations);
    this.form.updateValueAndValidity();
  }

  isDirty(): boolean {
    return this.form.dirty || this.image() !== null;
  }

  pick(file: File): void {
    this.revokeImageUrl();
    this.image.set(file);
  }

  preview(locale: string): void {
    const fields = this.form.getRawValue()[locale];
    const file = this.image();
    if (file && !this.imageUrl) this.imageUrl = URL.createObjectURL(file);
    const data: MethodPreview = {
      name: fields?.name ?? "",
      description: fields?.description ?? "",
      image: file ? this.imageUrl : (this.item()?.asset ?? null),
    };
    this.dialog.open(MethodPreviewDialog, { width: "871px", data });
  }

  save(): Promise<void> {
    const editing = this.item() !== null;
    return this.flow.run(
      this.saving,
      async () => {
        const translations = this.form.getRawValue();
        const id = await this.record.write(
          () => this.methods.create({ translations, groupId: this.groupId() }),
          (savedId) => this.methods.update(savedId, { translations }),
        );
        const image = this.image();
        if (image) await firstValueFrom(this.assets.put({ ownerType: "method", ownerId: id, slot: "photo" }, image));
        this.settle();
      },
      editing ? "Método actualizado" : "Método agregado",
      "No se pudo guardar el método",
    );
  }

  async remove(): Promise<void> {
    const id = this.record.savedId;
    if (id === null) return;
    if (!(await this.flow.confirmDelete("Eliminar método", "¿Estás seguro que deseas eliminar este método?"))) return;
    await this.flow.run(
      this.saving,
      async () => {
        await firstValueFrom(this.methods.delete(id));
        this.settle();
      },
      "Método eliminado",
      "No se pudo eliminar el método",
    );
  }

  private settle(): void {
    this.form.markAsPristine();
    this.image.set(null);
  }

  private revokeImageUrl(): void {
    if (this.imageUrl) URL.revokeObjectURL(this.imageUrl);
    this.imageUrl = null;
  }
}
