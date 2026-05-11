import { Component, inject, input } from "@angular/core";
import type { Group } from "@app/shared/models/group";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-works",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
})
export default class WorksComponent {
  private seo = inject(SeoService);
  private session = inject(SessionService);

  readonly language = this.session.language;
  readonly info = input.required<Group>();

  constructor() {
    this.seo.setPageTitle("GMCAN | " + this.language().futureWorks);
  }
}
