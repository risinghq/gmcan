import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import { ICONS, type IconName } from "./icons";

/**
 * A Tabler icon drawn inline. Its box is 1em square, so a consumer sizes it
 * with font-size; the base rule lives in styles.scss as an element selector so
 * any consumer class wins over it. It is decorative unless the consumer gives
 * it a label.
 */
@Component({
  selector: "app-icon",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: "",
  host: { "aria-hidden": "true", "[innerHTML]": "markup()" },
})
export class IconComponent {
  readonly name = input.required<IconName>();

  private readonly sanitizer = inject(DomSanitizer);

  readonly markup = computed(() => this.sanitizer.bypassSecurityTrustHtml(ICONS[this.name()]));
}
