import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { type FormArray, type FormControl, ReactiveFormsModule } from "@angular/forms";

import { requiredText } from "./text-fields";

@Component({
  selector: "app-text-list",
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./content-form.scss",
  template: `
    <div class="mb-12">{{ label() }}</div>
    @for (control of list().controls; track control; let i = $index) {
      <div class="flex-news mb-12">
        <textarea class="input-category full-width" [formControl]="control"></textarea>
        <button type="button" class="link green-text ml-16" (click)="remove(i)">Quitar</button>
      </div>
    }
    <button type="button" class="link green-text mb-12" (click)="add()">+ Agregar</button>
  `,
})
export class TextListComponent {
  readonly label = input.required<string>();
  readonly list = input.required<FormArray<FormControl<string>>>();

  add(): void {
    this.list().push(requiredText());
    this.list().markAsDirty();
  }

  remove(index: number): void {
    this.list().removeAt(index);
    this.list().markAsDirty();
  }
}
