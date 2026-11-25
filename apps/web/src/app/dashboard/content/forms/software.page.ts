import { ChangeDetectionStrategy, Component, type OnInit, inject, input, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { CONTENT_LOCALES, localeForm, localeLabel } from "@app/shared/forms/locale-form";
import type { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GroupService } from "@app/shared/services/group.service";
import type { AdminSoftware } from "@gmcan/contracts/admin";
import { AutosizeModule } from "ngx-autosize";
import { firstValueFrom, map } from "rxjs";

import { ContentFormFlow } from "./content-form-flow";
import { ContentFormComponent } from "./content-form.component";
import { RecordSave } from "./record-save";
import { optionalText, requiredText } from "./text-fields";

@Component({
  selector: "app-software-page",
  imports: [ReactiveFormsModule, AutosizeModule, ContentFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./content-form.scss",
  template: `
    <app-content-form
      [saveLabel]="item() ? 'Guardar cambios' : 'Guardar software'"
      [deleteLabel]="item() ? 'Eliminar software' : null"
      [canSave]="valid() && !saving()"
      [busy]="saving()"
      (save)="save()"
      (remove)="remove()"
    >
      <form [formGroup]="form" class="mt-24 mb-32">
        @for (locale of locales; track locale) {
          <div class="locale-section full-width" [formGroupName]="locale">
            <div class="locale-title">{{ label(locale) }}</div>
            <div class="text-category">Nombre del software <span class="red-text">*</span></div>
            <input class="input-category" formControlName="name" />
            <div class="text-category">Descripción</div>
            <textarea class="input-category" formControlName="description" autosize></textarea>
          </div>
        }
      </form>
      <div class="full-width mb-32">
        <div class="text-category">Enlace</div>
        <input class="input-category" type="url" [formControl]="moreInfo" />
      </div>
    </app-content-form>
  `,
})
export default class SoftwarePage implements OnInit, HasUnsavedChanges {
  readonly item = input<AdminSoftware | null>(null);
  readonly groupId = input.required<number>();

  private readonly group = inject(GroupService);
  private readonly flow = inject(ContentFormFlow);

  readonly locales = CONTENT_LOCALES;
  readonly label = localeLabel;
  readonly form = localeForm(() => ({ name: requiredText(), description: optionalText() }));
  readonly moreInfo = new FormControl("", { nonNullable: true });
  readonly valid = toSignal(this.form.statusChanges.pipe(map((status) => status === "VALID")), {
    initialValue: false,
  });
  readonly saving = signal(false);
  private record = new RecordSave(null);

  ngOnInit(): void {
    const item = this.item();
    this.record = new RecordSave(item?.id ?? null);
    if (item) {
      this.form.patchValue(item.translations);
      this.moreInfo.setValue(item.moreInfo ?? "");
    }
    this.form.updateValueAndValidity();
  }

  isDirty(): boolean {
    return this.form.dirty || this.moreInfo.dirty;
  }

  save(): Promise<void> {
    const editing = this.item() !== null;
    return this.flow.run(
      this.saving,
      async () => {
        const body = { translations: this.form.getRawValue(), moreInfo: this.moreInfo.value.trim() };
        await this.record.write(
          () => this.group.createSoftware({ ...body, groupId: this.groupId() }),
          (id) => this.group.updateSoftware(id, body),
        );
        this.settle();
      },
      editing ? "Software actualizado" : "Software agregado",
      "No se pudo guardar el software",
    );
  }

  async remove(): Promise<void> {
    const id = this.record.savedId;
    if (id === null) return;
    if (!(await this.flow.confirmDelete("Eliminar software", "¿Estás seguro que deseas eliminar este software?")))
      return;
    await this.flow.run(
      this.saving,
      async () => {
        await firstValueFrom(this.group.deleteSoftware(id));
        this.settle();
      },
      "Software eliminado",
      "No se pudo eliminar el software",
    );
  }

  private settle(): void {
    this.form.markAsPristine();
    this.moreInfo.markAsPristine();
  }
}
