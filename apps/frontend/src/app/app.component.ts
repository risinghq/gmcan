import { Component, Renderer2, HostListener } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router, NavigationEnd, RouterOutlet } from "@angular/router";
import { filter } from "rxjs/operators";

import { Languages } from "../app/models/languages";
import { Grupo } from "./models/grupo";
import { GLOBAL } from "./services/global";
import { GrupoService } from "./services/grupo.service";
import { SessionService } from "./services/session.service";
declare const gtag: Function;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  imports: [RouterOutlet],
})
export class AppComponent {
  screenWidth: number;
  public grupoinfo: Grupo;
  public url;
  enteredButton = false;
  isMatMenuOpen = false;
  prevButtonTrigger;
  language;
  public searchGlobalForm: FormGroup;
  constructor(
    public _route: ActivatedRoute,
    public _router: Router,
    private ren: Renderer2,
    public _grupoService: GrupoService,
    private session: SessionService,
    public fb: FormBuilder,
    private router: Router,
  ) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      /** START : Code to Track Page View  */
      gtag("event", "page_view", {
        page_path: event.urlAfterRedirects,
      });
      /** END */
    });
    this.searchGlobalForm = this.fb.group({
      nombre: [""],
    });
    this.language = Languages[this.lanSelected];
    if (JSON.parse(localStorage.getItem("lanId"))) {
      this.language = Languages[JSON.parse(localStorage.getItem("lanId"))];
      this.lanSelected = JSON.parse(localStorage.getItem("lanId"));
    }
    this.url = GLOBAL.url;
    // set screenWidth on page load
    this.screenWidth = window.innerWidth;
    this.grupoinfo = new Grupo(
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

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit() {
    console.log(this.session.locale);
    this.getGrupoInfo();
    localStorage.setItem("language", JSON.stringify(this.language));
    this.verifyLocale(JSON.parse(localStorage.getItem("language")));
  }

  lanSelected = 0;

  verifyLocale(language) {
    if (language.locale == "en") {
      this.english();
    } else {
      this.spanish();
    }
  }

  english() {
    console.log("hola");
    this.session.registerCulture("en-US");
  }

  spanish() {
    this.session.registerCulture("es-Ar");
  }

  lanSelect(number) {
    this.lanSelected = number;
    this.verifyLocale(this.language);
    localStorage.setItem("language", JSON.stringify(this.language));
    localStorage.setItem("lanId", JSON.stringify(number));
    window.location.reload();
  }

  getGrupoInfo() {
    this._grupoService.getGrupoInfo().subscribe((res) => {
      this.grupoinfo = res[0];
      localStorage.setItem("grupoInfo", JSON.stringify(this.grupoinfo));
      this.grupoinfo.logoHeader = this.url + "grupo/get-image-grupo/" + this.grupoinfo.logoHeader;
    });
  }
  inputExpand = false;
  expandInput() {
    this.inputExpand = !this.inputExpand;
    if (this.inputExpand) {
      document.getElementById("inputExpand").setAttribute("class", "search-top-input search-top-input-decompressed");
    } else {
      document.getElementById("inputExpand").setAttribute("class", "search-top-input search-top-input-compressed");
    }
  }

  /* globalSearch */

  searchGlobal(value) {
    this._router.navigate(["/search/" + value]);
  }
}
