import { Component, inject } from "@angular/core";
import { AboutFacade } from "@app/public/about/facade";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-method",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [],
})
export default class MethodComponent {
  private readonly seo = inject(SeoService);
  private readonly session = inject(SessionService);
  private readonly facade = inject(AboutFacade);

  readonly language = this.session.language;
  readonly methods = this.facade.methods;

  constructor() {
    this.seo.setPageTitle("GMCAN | " + this.language().methods);
    void this.facade.loadMethods();
  }
}
