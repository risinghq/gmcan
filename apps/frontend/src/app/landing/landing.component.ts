import { Location, NgStyle, NgIf, NgClass } from "@angular/common";
import { Component, OnInit, Renderer2, HostListener } from "@angular/core";
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from "@angular/material/sidenav";
import { MatToolbar } from "@angular/material/toolbar";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

import { HomeComponent } from "../home/home.component";
import { Grupo } from "../models/grupo";
import { Languages } from "../models/languages";
import { GLOBAL } from "../services/global";
import { GrupoService } from "../services/grupo.service";
import { SessionService } from "../services/session.service";

@Component({
  selector: "app-landing",
  templateUrl: "./landing.component.html",
  styleUrls: ["./landing.component.scss"],
  imports: [
    MatSidenavContainer,
    MatSidenav,
    MatIcon,
    RouterLink,
    RouterLinkActive,
    MatSidenavContent,
    NgStyle,
    NgIf,
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    MatToolbar,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    RouterOutlet,
    HomeComponent,
  ],
})
export class LandingComponent implements OnInit {
  screenWidth: number;
  public grupoinfo: Grupo;
  public url;
  enteredButton = false;
  isMatMenuOpen = false;
  prevButtonTrigger;
  language;
  public searchGlobalForm: FormGroup;
  public searchGlobalForm2: FormGroup;
  constructor(
    public _route: ActivatedRoute,
    public _router: Router,
    private ren: Renderer2,
    public _grupoService: GrupoService,
    private session: SessionService,
    public fb: FormBuilder,
    public location: Location,
    private titleService: Title,
  ) {
    this.searchGlobalForm = this.fb.group({
      nombre: [""],
    });
    this.searchGlobalForm2 = this.fb.group({
      nombre1: [""],
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
    this.titleService.setTitle("GMCAN | UNMSM");
    this.getGrupoInfo();
    localStorage.setItem("language", JSON.stringify(this.language));
  }

  lanSelected = 0;

  lanSelect(number) {
    this.lanSelected = number;
    localStorage.setItem("language", JSON.stringify(Languages[this.lanSelected]));
    localStorage.setItem("lanId", JSON.stringify(number));
    window.location.reload();
  }

  getGrupoInfo() {
    this._grupoService.getGrupoInfo().subscribe((res) => {
      this.grupoinfo = res[0];
      localStorage.setItem("grupoInfo", JSON.stringify(this.grupoinfo));
      this.grupoinfo.logoHeader = this.url + "grupo/get-image-grupo/" + this.grupoinfo.logoHeader;
      this.grupoinfo.logoFooter = this.url + "grupo/get-image-grupo/" + this.grupoinfo.logoFooter;
    });
  }
  inputExpand = false;
  expandInput() {
    this.inputExpand = !this.inputExpand;
    if (this.inputExpand) {
      document.getElementById("inputExpand").setAttribute("class", "search-top-input search-top-input-decompressed");
      document.getElementById("formExpand").setAttribute("class", "full-width");
    } else {
      document.getElementById("inputExpand").setAttribute("class", "search-top-input search-top-input-compressed");
      document.getElementById("formExpand").setAttribute("class", "");
    }
  }

  /* globalSearch */

  searchGlobal(value) {
    window.location.href = "/home/search/" + value;
  }

  loginLink() {
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(["/login"]);
  }

  scroll() {
    let el = document.getElementById("main-toolbar");
    el.scrollIntoView({ behavior: "smooth" });
  }
}
