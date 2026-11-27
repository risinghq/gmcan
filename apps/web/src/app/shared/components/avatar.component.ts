import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from "@angular/core";

/**
 * A round member photo. The host takes its size from the class the consumer puts on it; without a photo, or when
 * the photo fails to load, it shows the person's initials. The initials are decorative: a name always sits next to
 * the avatar.
 */
@Component({
  selector: "app-avatar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src() && !failed()) {
      <img [src]="src()" [alt]="alt()" [attr.loading]="loading()" (error)="failed.set(true)" />
    } @else {
      <span class="initials" aria-hidden="true">{{ initials() }}</span>
    }
  `,
  styles: `
    :host {
      display: inline-block;
      flex: none;
      overflow: hidden;
      border-radius: 50%;
      container-type: size;
    }

    img,
    .initials {
      display: block;
      width: 100%;
      height: 100%;
    }

    img {
      object-fit: cover;
    }

    .initials {
      display: grid;
      place-items: center;
      background-color: #e3e9e1;
      color: var(--deep-green, #1f4d36);
      font-size: max(40cqmin, 10px);
      font-weight: 600;
      line-height: 1;
      letter-spacing: 0.02em;
      user-select: none;
    }
  `,
})
export class AvatarComponent {
  readonly src = input<string | null | undefined>(null);
  readonly alt = input("");
  readonly name = input("");
  readonly loading = input<"lazy" | "eager">("lazy");

  readonly failed = linkedSignal({ source: this.src, computation: () => false });

  readonly initials = computed(() => initials(this.name()));
}

/** A leading abbreviation followed by two more words is an academic prefix, as in "Dr. Ana Torres". */
export function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const named = words.length > 2 && words[0]!.endsWith(".") ? words.slice(1) : words;
  return named
    .map((word) => word.match(/\p{L}/u)?.[0] ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase();
}
