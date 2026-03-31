import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

import { Equipo } from "../models/equipo";
import { Grupo } from "../models/grupo";
import { Software } from "../models/software";
import { EquipoService } from "../services/equipo.service";
import { GLOBAL } from "../services/global";
import { GrupoService } from "../services/grupo.service";
import { SoftwareService } from "../services/software.service";

@Component({
  standalone: false,
  selector: "app-facilities",
  templateUrl: "./facilities.component.html",
  styleUrls: ["./facilities.component.scss"],
})
export class FacilitiesComponent implements OnInit {
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
