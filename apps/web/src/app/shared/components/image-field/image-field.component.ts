import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from "@angular/core";

@Component({
  selector: "app-image-field",
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./image-field.component.scss",
  template: `
    <div class="text-category">{{ label() }}</div>
    @if (shown(); as src) {
      <div class="img-preview"><img class="img-set" [src]="src" alt="" /></div>
    } @else {
      <div class="news-img"><img class="icon-upload" src="/img/icons/upload.svg" alt="" /></div>
    }
    <label class="green-text mt-16">
      <span class="plex-sans">{{ shown() ? "Cambiar imagen" : "Insertar imagen" }}</span>
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
