import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";

import { Grupo } from "../models/grupo";
import { GrupoService } from "../services/grupo.service";

@Component({
  standalone: false,
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.scss"],
})
export class AboutComponent implements OnInit {
  public info: Grupo;
  constructor(
    public _grupoService: GrupoService,
    public _route: ActivatedRoute,
    public _router: Router,
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

  selectedCategory;

  language;

  ngOnInit() {
    this.language = JSON.parse(localStorage.getItem("language"));
    this.verifyRoutes(this._router.url);
  }

  verifyRoutes(route) {
    switch (route) {
      case "/home/about-us/about":
        this.selectedCategory = this.language.who;
        break;
      case "/home/about-us/lines-investigation":
        this.selectedCategory = this.language.linesInvestigation;
        break;
      case "/home/about-us/methods":
        this.selectedCategory = this.language.methods;
        break;
      case "/home/about-us/facilities-resources":
        this.selectedCategory = this.language.resources;
        break;
      case "/home/about-us/works":
        this.selectedCategory = this.language.futureWorks;
        break;
      default:
        break;
    }
  }

  selected(element) {
    this.selectedCategory = element;
  }
}
