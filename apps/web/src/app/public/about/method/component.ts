import { Component, inject, input } from "@angular/core";
import type { Method } from "@app/shared/models/method";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-method",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [],
})
export default class MethodComponent {
  private seo = inject(SeoService);
  private session = inject(SessionService);

  readonly language = this.session.language;
  readonly methods = input.required<Method[]>();

  constructor() {
    this.seo.setPageTitle("GMCAN | " + this.language().methods);
  }
}
