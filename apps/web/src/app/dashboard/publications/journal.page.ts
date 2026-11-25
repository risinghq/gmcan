import { ChangeDetectionStrategy, Component, type OnInit, inject, input, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule } from "@angular/forms";
import type { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { type JournalItem, RefService } from "@app/shared/services/ref.service";
import { firstValueFrom, map } from "rxjs";

import { ContentFormFlow } from "../content/forms/content-form-flow";
import { ContentFormComponent } from "../content/forms/content-form.component";
import { RecordSave } from "../content/forms/record-save";
import { requiredText } from "../content/forms/text-fields";

const JOURNAL_LIST = "/dashboard/articulos";

@Component({
  selector: "app-journal-page",
  imports: [ReactiveFormsModule, ContentFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "../content/forms/content-form.scss",
  template: `
    <app-content-form
      backTo="/dashboard/articulos"
      [saveLabel]="item() ? 'Actualizar revista' : 'Guardar revista'"
      [deleteLabel]="item() ? 'Eliminar revista' : null"
      [canSave]="valid() && !saving()"
      [busy]="saving()"
      (save)="save()"
      (remove)="remove()"
    >
      <div class="full-width mt-24 mb-32">
        <div class="text-category">Nombre oficial de la revista <span class="red-text">*</span></div>
        <input class="input-category" [formControl]="name" placeholder="Ingresar nombre" />
      </div>
    </app-content-form>
  `,
})
export default class JournalPage implements OnInit, HasUnsavedChanges {
  readonly item = input<JournalItem | null>(null);

  private readonly refs = inject(RefService);
  private readonly flow = inject(ContentFormFlow);

  readonly name = requiredText();
  readonly valid = toSignal(this.name.statusChanges.pipe(map((status) => status === "VALID")), {
    initialValue: false,
  });
  readonly saving = signal(false);
  private record = new RecordSave(null);

  ngOnInit(): void {
    const item = this.item();
    this.record = new RecordSave(item?.id ?? null);
    if (item) this.name.setValue(item.name);
    this.name.updateValueAndValidity();
  }

  isDirty(): boolean {
    return this.name.dirty;
  }

  save(): Promise<void> {
    const body = { name: this.name.value.trim() };
    return this.flow.run(
      this.saving,
      async () => {
        await this.record.write(
          () => this.refs.createJournal(body),
          (id) => this.refs.updateJournal(id, body),
        );
        this.name.markAsPristine();
      },
      this.item() ? "Revista actualizada" : "Revista agregada",
      "No se pudo guardar la revista",
      JOURNAL_LIST,
    );
  }

  async remove(): Promise<void> {
    const id = this.record.savedId;
    if (id === null) return;
    if (!(await this.flow.confirmDelete("Eliminar revista", "¿Estás seguro que deseas eliminar esta revista?"))) return;
    await this.flow.run(
      this.saving,
      async () => {
        await firstValueFrom(this.refs.deleteJournal(id));
        this.name.markAsPristine();
      },
      "Revista eliminada",
      "No se pudo eliminar la revista",
      JOURNAL_LIST,
    );
  }
}
