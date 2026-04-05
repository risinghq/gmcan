import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { Router, ActivatedRoute, RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { createGrupo } from "@app/shared/models/factories";
import type { Grupo } from "@app/shared/models/grupo";
import { GrupoService } from "@app/shared/services/grupo.service";

import { AboutFacade } from "./facade";

@Component({
  selector: "app-about",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [MatIcon, RouterOutlet, RouterLink, RouterLinkActive],
  providers: [AboutFacade],
})
export default class AboutComponent implements OnInit {
  _grupoService = inject(GrupoService);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  readonly facade = inject(AboutFacade);

  public info: Grupo;
  constructor() {
    this.info = createGrupo();
  }

  ngOnInit(): void {
    this.facade.init(this._router.url);
  }

  selected(element: string): void {
    this.facade.setSelectedCategory(element);
  }
}
