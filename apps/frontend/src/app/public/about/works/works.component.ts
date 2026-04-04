import { Component, OnInit, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { createGrupo } from "@app/shared/models/factories";
import type { Grupo } from "@app/shared/models/grupo";
import { Languages } from "@app/shared/models/languages";
import { GrupoService } from "@app/shared/services/grupo.service";

@Component({
  selector: "app-works",
  templateUrl: "./works.component.html",
  styleUrls: ["./works.component.scss"],
})
export default class WorksComponent implements OnInit {
  _grupoService = inject(GrupoService);
  private titleService = inject(Title);

  public info: Grupo;
  language: (typeof Languages)[number] = Languages[0];
  constructor() {
    this.info = createGrupo();
  }

  ngOnInit(): void {
    this.language = JSON.parse(localStorage.getItem("language") ?? JSON.stringify(Languages[0]));
    this.titleService.setTitle("GMCAN | " + this.language.futureWorks);
    this.getGrupoInfo();
  }

  getGrupoInfo(): void {
    this._grupoService.getGrupoInfo().subscribe((res: Grupo[]) => {
      this.info = res[0];
      const works = document.getElementById("works");
      if (works) {
        works.innerHTML = this.info.trabajosFuturos ?? "";
      }
    });
  }
}
