import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import type { SobreNosotros } from "@app/shared/models/aboutus";
import { Languages } from "@app/shared/models/languages";
import { AboutUsService } from "@app/shared/services/aboutus.service";
import { GLOBAL } from "@app/shared/services/global";

@Component({
  selector: "app-about-us",
  templateUrl: "./about-us.component.html",
  styleUrls: ["./about-us.component.scss"],
  imports: [],
})
export default class AboutUsComponent implements OnInit {
  url: string;
  language: (typeof Languages)[number] = Languages[0];

  aboutus: SobreNosotros;

  constructor(
    public aboutusService: AboutUsService,
    private titleService: Title,
  ) {
    this.aboutus = {
      idSobreNosotros: 0,
      quienesSomos: "",
      quienesSomosEN: "",
      foto: "",
      objetivos: "",
      objetivosEN: "",
      servicios: "",
      serviciosEN: "",
      grupo_idGrupo: 0,
    };
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.language = JSON.parse(localStorage.getItem("language") ?? JSON.stringify(Languages[0]));
    this.getAboutUs();
    this.titleService.setTitle("GMCAN | " + this.language.who);
  }

  getAboutUs(): void {
    this.aboutusService.getAboutUsInfo().subscribe((res: SobreNosotros[]) => {
      this.aboutus = res[0];
      const services = document.getElementById("services");
      const whoAre = document.getElementById("whoAre");
      const objectives = document.getElementById("objectives");
      if (services) {
        services.innerHTML = this.aboutus.servicios ?? "";
      }
      if (whoAre) {
        whoAre.innerHTML = this.aboutus.quienesSomos ?? "";
      }
      if (objectives) {
        objectives.innerHTML = this.aboutus.objetivos ?? "";
      }
    });
  }
}
