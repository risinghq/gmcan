import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from "@angular/core";

import { IconComponent } from "../icon/icon.component";

@Component({
  selector: "app-image-field",
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./image-field.component.scss",
  imports: [IconComponent],
  template: `
    <div class="text-category">{{ label() }}</div>
    <label class="picker">
      @if (shown(); as src) {
        <span class="tile"><img [src]="src" alt="" /></span>
      } @else {
        <span class="tile empty"><app-icon name="photo-up" /></span>
      }
      <span class="action">{{ shown() ? "Cambiar imagen" : "Insertar imagen" }}</span>
      <input class="file_upload" type="file" accept="image/*" (change)="pick($event)" />
    </label>
  `,
})
export class ImageFieldComponent {
  readonly label = input("Imagen");
  readonly current = input<string | null>(null);
  readonly picked = output<File>();

  private readonly preview = signal<string | null>(null);
  readonly shown = computed(() => this.preview() ?? this.current());

  constructor() {
    inject(DestroyRef).onDestroy(() => this.revoke());
  }

  pick(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file?.type.startsWith("image/")) return;
    this.revoke();
    this.preview.set(URL.createObjectURL(file));
    this.picked.emit(file);
  }

  private revoke(): void {
    const url = this.preview();
    if (url) URL.revokeObjectURL(url);
  }
}
