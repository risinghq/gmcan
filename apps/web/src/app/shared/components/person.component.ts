import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { AvatarComponent } from "@app/shared/components/avatar.component";

/** A small avatar beside a person's name on one line. Projected content replaces the name as the label. */
@Component({
  selector: "app-person",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent],
  template: `
    <app-avatar [src]="src()" [alt]="alt()" [name]="name()" />
    <span
      ><ng-content>{{ name() }}</ng-content></span
    >
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }

    :host + :host {
      margin-top: 4px;
    }

    app-avatar {
      width: 20px;
      height: 20px;
    }
  `,
})
export class PersonComponent {
  readonly name = input.required<string>();
  readonly src = input<string | null | undefined>(null);
  readonly alt = input("");
}
