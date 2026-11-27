import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "app-news-meta",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (type()) {
      <span class="type">{{ type() }}</span><span aria-hidden="true">&nbsp;· </span>
    }
    <time [attr.datetime]="date()">{{ label() }}</time>
  `,
  styles: `
    :host {
      display: block;
      line-height: 1.3;
      letter-spacing: 0.3px;
      color: #30393a;
    }

    .type {
      color: var(--deep-green);
    }
  `,
})
export class NewsMetaComponent {
  readonly type = input.required<string>();
  readonly date = input.required<string>();
  readonly label = input.required<string>();
}
