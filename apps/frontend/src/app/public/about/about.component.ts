import { Component, OnInit } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { Router, ActivatedRoute, Params, RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { Grupo } from "@app/shared/models/grupo";
import { GrupoService } from "@app/shared/services/grupo.service";

@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.scss"],
  imports: [MatIcon, RouterOutlet, RouterLink, RouterLinkActive],
})
export default class AboutComponent implements OnInit {
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
