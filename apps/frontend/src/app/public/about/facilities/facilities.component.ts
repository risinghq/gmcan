import { Component, OnInit, inject } from "@angular/core";
import { MatChip, MatChipSet } from "@angular/material/chips";
import { Title } from "@angular/platform-browser";
import { Equipo } from "@app/shared/models/equipo";
import { createGrupo } from "@app/shared/models/factories";
import type { Grupo } from "@app/shared/models/grupo";
import { Software } from "@app/shared/models/software";
import { EquipoService } from "@app/shared/services/equipo.service";
import { GLOBAL } from "@app/shared/services/global";
import { GrupoService } from "@app/shared/services/grupo.service";
import { SoftwareService } from "@app/shared/services/software.service";

@Component({
  selector: "app-facilities",
  templateUrl: "./facilities.component.html",
  styleUrls: ["./facilities.component.scss"],
  imports: [MatChipSet, MatChip],
})
export default class FacilitiesComponent implements OnInit {
  _equipoService = inject(EquipoService);
  _softwareService = inject(SoftwareService);
  _grupoService = inject(GrupoService);
  private titleService = inject(Title);

  equipos: Equipo[] = [];
  software: Software[] = [];
  url: string;
  grupo: Grupo;

  public page1 = 1;
  public pageSize = 5;

  public page2 = 1;

  constructor() {
    this.url = GLOBAL.url;
    this.grupo = createGrupo();
  }

  language: any = { locale: "es", resources: "Facilidades y recursos" };

  ngOnInit(): void {
    this.language = JSON.parse(
      localStorage.getItem("language") ?? '{"locale":"es","resources":"Facilidades y recursos"}',
    );
    this.titleService.setTitle("GMCAN | " + this.language.resources);
    this.getEquipos();
    this.getSoftware();
    this.getGrupo();
  }

  getGrupo(): void {
    this._grupoService.getFacilidadesRecursos().subscribe((res: Grupo[]) => {
      this.grupo = res[0];
      if (this.language.locale === "en") {
        this.grupo.facilidadesRecursos = this.grupo.facilidadesRecursosEN;
      }
    });
  }

  getEquipos(): void {
    this._equipoService.getEquipos().subscribe((res: Equipo[]) => {
      this.equipos = res;
    });
  }

  getSoftware(): void {
    this._softwareService.getSoftware().subscribe((res: Software[]) => {
      this.software = res;
    });
  }

  scroll(): void {
    const el = document.getElementById("main-toolbar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }
}
