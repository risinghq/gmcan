import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

import { Grupo } from "../models/grupo";
import { GrupoService } from "../services/grupo.service";

@Component({
  standalone: false,
  selector: "app-works",
  templateUrl: "./works.component.html",
  styleUrls: ["./works.component.scss"],
})
export class WorksComponent implements OnInit {
  public info: Grupo;
  language;
  constructor(
    public _grupoService: GrupoService,
    private titleService: Title,
  ) {
    this.info = new Grupo(
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

  ngOnInit() {
    this.language = JSON.parse(localStorage.getItem("language"));
    this.titleService.setTitle("GMCAN | " + this.language.futureWorks);
    this.getGrupoInfo();
  }

  getGrupoInfo() {
    this._grupoService.getGrupoInfo().subscribe((res) => {
      this.info = res[0];
      document.getElementById("works").innerHTML = this.info.trabajosFuturos;
    });
  }
}
