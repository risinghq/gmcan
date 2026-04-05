import { Component, OnInit, inject } from "@angular/core";
import type { SobreNosotros } from "@app/shared/models/aboutus";
import { Languages } from "@app/shared/models/languages";
import { AboutUsService } from "@app/shared/services/aboutus.service";
import { GLOBAL } from "@app/shared/services/global";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-about-us",
  templateUrl: "./about-us.component.html",
  styleUrl: "./about-us.component.scss",
  imports: [],
})
export default class AboutUsComponent implements OnInit {
  aboutusService = inject(AboutUsService);
  private seo = inject(SeoService);
  private session = inject(SessionService);

  url: string;
  language: (typeof Languages)[number] = Languages[0];

  aboutus: SobreNosotros;

  constructor() {
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
    this.language = this.session.language();
    this.getAboutUs();
    this.seo.setPageTitle("GMCAN | " + this.language.who);
  }

  getAboutUs(): void {
    this.aboutusService.getAboutUsInfo().subscribe((res: SobreNosotros[]) => {
      this.aboutus = res[0];
    });
  }
}
