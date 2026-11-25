import { ChangeDetectionStrategy, Component, type OnInit, inject, input, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import type { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GroupService } from "@app/shared/services/group.service";
import type { AdminEquipment } from "@gmcan/contracts/admin";
import { firstValueFrom, map } from "rxjs";

import { ContentFormFlow } from "./content-form-flow";
import { ContentFormComponent } from "./content-form.component";
import { RecordSave } from "./record-save";
import { optionalText, requiredText } from "./text-fields";

/** Equipment specs are model names and sizes, the same in every language, so equipment has no translations. */
@Component({
  selector: "app-equipment-page",
  imports: [ReactiveFormsModule, ContentFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./content-form.scss",
  template: `
    <app-content-form
      [saveLabel]="item() ? 'Guardar cambios' : 'Guardar equipo'"
      [deleteLabel]="item() ? 'Eliminar equipo' : null"
      [canSave]="valid() && !saving()"
      [busy]="saving()"
      (save)="save()"
      (remove)="remove()"
    >
      <form [formGroup]="form" class="mt-24 mb-32">
        <div class="flex-news">
          <div class="mr-32 full-width">
            <div class="text-category">Nombre del equipo <span class="red-text">*</span></div>
            <input class="input-category" formControlName="name" />
          </div>
          <div class="full-width">
            <div class="text-category">CPU</div>
            <input class="input-category" formControlName="cpu" />
          </div>
        </div>
        <div class="flex-news">
          <div class="mr-32 full-width">
            <div class="text-category">RAM</div>
            <input class="input-category" formControlName="ram" />
          </div>
          <div class="full-width">
            <div class="text-category">GPU</div>
            <input class="input-category" formControlName="gpu" />
          </div>
        </div>
        <div class="mr-32 mid-width">
          <div class="text-category">HD</div>
          <input class="input-category" formControlName="storage" />
        </div>
      </form>
    </app-content-form>
  `,
})
export default class EquipmentPage implements OnInit, HasUnsavedChanges {
  readonly item = input<AdminEquipment | null>(null);
  readonly groupId = input.required<number>();

  private readonly group = inject(GroupService);
  private readonly flow = inject(ContentFormFlow);

  readonly form = new FormGroup({
    name: requiredText(),
    cpu: optionalText(),
    ram: optionalText(),
    gpu: optionalText(),
    storage: optionalText(),
  });
  readonly valid = toSignal(this.form.statusChanges.pipe(map((status) => status === "VALID")), {
    initialValue: false,
  });
  readonly saving = signal(false);
  private record = new RecordSave(null);

  ngOnInit(): void {
    const item = this.item();
    this.record = new RecordSave(item?.id ?? null);
    if (item) {
      this.form.patchValue({
        name: item.name,
        cpu: item.cpu ?? "",
        ram: item.ram ?? "",
        gpu: item.gpu ?? "",
        storage: item.storage ?? "",
      });
    }
    this.form.updateValueAndValidity();
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  save(): Promise<void> {
    const editing = this.item() !== null;
    return this.flow.run(
      this.saving,
      async () => {
        const fields = this.form.getRawValue();
        await this.record.write(
          () => this.group.createEquipment({ ...fields, groupId: this.groupId() }),
          (id) => this.group.updateEquipment(id, fields),
        );
        this.form.markAsPristine();
      },
      editing ? "Equipo actualizado" : "Equipo agregado",
      "No se pudo guardar el equipo",
    );
  }

  async remove(): Promise<void> {
    const id = this.record.savedId;
    if (id === null) return;
    if (!(await this.flow.confirmDelete("Eliminar equipo", "¿Estás seguro que deseas eliminar este equipo?"))) return;
    await this.flow.run(
      this.saving,
      async () => {
        await firstValueFrom(this.group.deleteEquipment(id));
        this.form.markAsPristine();
      },
      "Equipo eliminado",
      "No se pudo eliminar el equipo",
    );
  }
}
