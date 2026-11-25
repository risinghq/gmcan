import { Component, inject, input, ChangeDetectionStrategy } from "@angular/core";
import type { About } from "@app/shared/models/about";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";
import { EmphasisPipe } from "@app/shared/utils/emphasis";

@Component({
  selector: "app-about-us",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [EmphasisPipe],
})
export default class AboutUsComponent {
  private seo = inject(SeoService);
  private session = inject(SessionService);

  readonly language = this.session.language;
  readonly aboutus = input.required<About>();

  constructor() {
    this.seo.setPageTitle("GMCAN | " + this.language().who);
  }
}
