import { Component, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";

import { AboutFacade } from "./facade";

@Component({
  selector: "app-about",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [MatIcon, RouterOutlet, RouterLink, RouterLinkActive],
  providers: [AboutFacade],
})
export default class AboutComponent {
  readonly facade = inject(AboutFacade);
}
