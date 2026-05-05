import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";

import { AboutFacade } from "./facade";

@Component({
  selector: "app-about",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [MatIcon, RouterOutlet, RouterLink, RouterLinkActive],
  providers: [AboutFacade],
})
export default class AboutComponent implements OnInit {
  private router = inject(Router);
  readonly facade = inject(AboutFacade);

  ngOnInit(): void {
    this.facade.init(this.router.url);
  }

  selected(element: string): void {
    this.facade.setSelectedCategory(element);
  }
}
