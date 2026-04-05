import { Component, OnInit, inject } from "@angular/core";
import { createGrupo } from "@app/shared/models/factories";
import type { Grupo } from "@app/shared/models/grupo";
import { Languages } from "@app/shared/models/languages";
import { GrupoService } from "@app/shared/services/grupo.service";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-works",
  templateUrl: "./works.component.html",
  styleUrl: "./works.component.scss",
})
export default class WorksComponent implements OnInit {
  _grupoService = inject(GrupoService);
  private seo = inject(SeoService);
  private session = inject(SessionService);

  public info: Grupo;
  language: (typeof Languages)[number] = Languages[0];
  constructor() {
    this.info = createGrupo();
  }

  ngOnInit(): void {
    this.language = this.session.language();
    this.seo.setPageTitle("GMCAN | " + this.language.futureWorks);
    this.getGrupoInfo();
  }

  getGrupoInfo(): void {
    this._grupoService.getGrupoInfo().subscribe((res: Grupo[]) => {
      this.info = res[0];
    });
  }
}
