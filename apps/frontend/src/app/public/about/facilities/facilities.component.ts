import { NgIf, NgFor, NgClass } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatChip } from "@angular/material/chips";
import { Title } from "@angular/platform-browser";
import { Equipo } from "@app/shared/models/equipo";
import { Grupo } from "@app/shared/models/grupo";
import { Software } from "@app/shared/models/software";
import { EquipoService } from "@app/shared/services/equipo.service";
import { GLOBAL } from "@app/shared/services/global";
import { GrupoService } from "@app/shared/services/grupo.service";
import { SoftwareService } from "@app/shared/services/software.service";

@Component({
  selector: "app-facilities",
  templateUrl: "./facilities.component.html",
  styleUrls: ["./facilities.component.scss"],
  imports: [NgIf, NgFor, NgClass, MatChip],
})
export default class FacilitiesComponent implements OnInit {
  equipos: Array<Equipo>;
  software: Array<Software>;
  url;
  grupo: Grupo;

  public page1;
  public pageSize;

  public page2;

  constructor(
    public _equipoService: EquipoService,
    public _softwareService: SoftwareService,
    public _grupoService: GrupoService,
    private titleService: Title,
  ) {
    this.url = GLOBAL.url;
    this.grupo = new Grupo(
      null,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      null,
      null,
    );
  }

  language;

  ngOnInit() {
    this.equipos = [];
    this.software = [];
    this.language = JSON.parse(localStorage.getItem("language"));
    this.titleService.setTitle("GMCAN | " + this.language.resources);
    this.page1 = 1;
    this.page2 = 1;
    this.pageSize = 5;
    this.getEquipos();
    this.getSoftware();
    this.getGrupo();
  }

  getGrupo() {
    this._grupoService.getFacilidadesRecursos().subscribe((res) => {
      this.grupo = res[0];
      if (this.language.locale == "en") {
        this.grupo.facilidadesRecursos = this.grupo.facilidadesRecursosEN;
      }
    });
  }

  getEquipos() {
    this._equipoService.getEquipos().subscribe((res) => {
      this.equipos = res;
    });
  }

  getSoftware() {
    this._softwareService.getSoftware().subscribe((res) => {
      this.software = res;
    });
  }

  scroll() {
    let el = document.getElementById("main-toolbar");
    el.scrollIntoView({ behavior: "smooth" });
  }
}
