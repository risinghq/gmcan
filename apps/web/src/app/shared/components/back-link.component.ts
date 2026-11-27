import { ChangeDetectionStrategy, Component } from "@angular/core";
import { IconComponent } from "@app/shared/components/icon/icon.component";

/** A back arrow and its label on a native link or button, so the host keeps its own navigation or click semantics. */
@Component({
  selector: "a[app-back-link], button[app-back-link]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `<app-icon name="arrow-left" /><ng-content />`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 44px;
      padding: 0;
      border: 0;
      background: none;
      font: inherit;
      font-size: 15px;
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: 0.3px;
      color: var(--muted-accent);
      text-decoration: none;
      cursor: pointer;
    }

    :host(:hover) {
      color: #000000;
    }

    app-icon {
      font-size: 20px;
    }
  `,
})
export class BackLinkComponent {}
