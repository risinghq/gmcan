import { ChangeDetectionStrategy, Component, input } from "@angular/core";

/** Projects the message for a list with no rows; a search that matches nothing gets its own. */
@Component({
  selector: "app-empty-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: "status" },
  template: `
    @if (searching()) {
      Ningún resultado coincide con la búsqueda.
    } @else {
      <ng-content />
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 32px 0;
      color: var(--muted-text);
      text-align: center;
    }
  `,
})
export class EmptyListComponent {
  readonly searching = input(false);
}
