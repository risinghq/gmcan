import { NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

import { SobreNosotros } from "../models/aboutus";
import { AboutUsService } from "../services/aboutus.service";
import { GLOBAL } from "../services/global";

@Component({
  selector: "app-about-us",
  templateUrl: "./about-us.component.html",
  styleUrls: ["./about-us.component.scss"],
  imports: [NgIf],
})
export class AboutUsComponent implements OnInit {
  url;
  language;

  aboutus: SobreNosotros;

  constructor(
    public aboutusService: AboutUsService,
    private titleService: Title,
  ) {
    this.aboutus = new SobreNosotros(null, "", "", null, "", "", "", null, null);
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    this.language = JSON.parse(localStorage.getItem("language"));
    this.getAboutUs();
    this.titleService.setTitle("GMCAN | " + this.language.who);
  }

  getAboutUs() {
    this.aboutusService.getAboutUsInfo().subscribe((res) => {
      this.aboutus = res[0];
      document.getElementById("services").innerHTML = this.aboutus.servicios;
      document.getElementById("whoAre").innerHTML = this.aboutus.quienesSomos;
      document.getElementById("objectives").innerHTML = this.aboutus.objetivos;
    });
  }
}
