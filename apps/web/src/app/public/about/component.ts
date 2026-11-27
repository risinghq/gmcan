import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { BreadcrumbComponent } from "@app/shared/components/breadcrumb.component";

import { AboutFacade } from "./facade";

@Component({
  selector: "app-about",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [BreadcrumbComponent, RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [AboutFacade],
})
export default class AboutComponent {
  readonly facade = inject(AboutFacade);
}
