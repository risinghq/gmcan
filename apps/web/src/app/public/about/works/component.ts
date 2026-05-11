import { Component, inject } from "@angular/core";
import { AboutFacade } from "@app/public/about/facade";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-works",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
})
export default class WorksComponent {
  private readonly seo = inject(SeoService);
  private readonly session = inject(SessionService);
  private readonly facade = inject(AboutFacade);

  readonly language = this.session.language;
  readonly group = this.facade.group;

  constructor() {
    this.seo.setPageTitle("GMCAN | " + this.language().futureWorks);
    void this.facade.loadGroup();
  }
}
