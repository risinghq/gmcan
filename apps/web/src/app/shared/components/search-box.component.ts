import { ChangeDetectionStrategy, Component, input, model, output } from "@angular/core";
import { IconComponent } from "@app/shared/components/icon/icon.component";

/** A search field and its button. Enter or the button emits the current query through `search`. */
@Component({
  selector: "app-search-box",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <form role="search" (submit)="submit($event)">
      <label class="field">
        <app-icon name="search" />
        <input
          #field
          type="search"
          class="input-search-text"
          autocomplete="off"
          [attr.aria-label]="placeholder()"
          [placeholder]="placeholder()"
          [value]="query()"
          (input)="query.set(field.value)"
        />
      </label>
      <button type="submit" class="btn-black">{{ action() }}</button>
    </form>
  `,
  styles: `
    :host {
      display: block;
    }

    form {
      display: flex;
      align-items: stretch;
      gap: 16px;
    }

    .field {
      display: flex;
      flex: 1;
      align-items: center;
      gap: 8px;
      min-width: 0;
      margin: 0;
      padding: 8px 12px;
      border-radius: 4px;
      box-shadow:
        -1px -1px 3px rgba(0, 0, 0, 0.1),
        1px 1px 3px rgba(0, 0, 0, 0.1);
      background-color: #ffffff;
      cursor: text;
    }

    app-icon {
      flex: none;
      font-size: 20px;
      color: var(--deep-green);
    }

    input {
      flex: 1;
      min-width: 0;
      padding: 0;
      border: 0;
      background: none;
      font-size: 16px;
      line-height: 24px;
      letter-spacing: 0.3px;
      color: #000000;
    }

    input::placeholder {
      color: var(--muted-accent);
    }

    button {
      flex: none;
      height: auto;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    @media (max-width: 960px) {
      form {
        gap: 8px;
      }
    }
  `,
})
export class SearchBoxComponent {
  readonly placeholder = input.required<string>();
  readonly action = input.required<string>();
  readonly query = model("");
  readonly search = output<string>();

  protected submit(event: Event): void {
    event.preventDefault();
    this.search.emit(this.query());
  }
}
