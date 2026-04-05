import { Location } from "@angular/common";
import { Component, OnInit, Renderer2, HostListener, inject } from "@angular/core";
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from "@angular/material/sidenav";
import { MatToolbar } from "@angular/material/toolbar";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { createGrupo } from "@app/shared/models/factories";
import type { Grupo } from "@app/shared/models/grupo";
import { Languages } from "@app/shared/models/languages";
import { GLOBAL } from "@app/shared/services/global";
import { GrupoService } from "@app/shared/services/grupo.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-landing",
  templateUrl: "./landing.component.html",
  styleUrl: "./landing.component.scss",
  imports: [
    MatSidenavContainer,
    MatSidenav,
    MatIcon,
    RouterLink,
    RouterLinkActive,
    MatSidenavContent,
    FormsModule,
    ReactiveFormsModule,
    MatToolbar,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    RouterOutlet,
  ],
})
export default class LandingComponent implements OnInit {
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  private ren = inject(Renderer2);
  _grupoService = inject(GrupoService);
  private session = inject(SessionService);
  fb = inject(FormBuilder);
  location = inject(Location);
  private titleService = inject(Title);

  screenWidth: number;
  public grupoinfo: Grupo;
  public url: string;
  enteredButton = false;
  isMatMenuOpen = false;
  prevButtonTrigger = false;
  language: any;
  public searchGlobalForm: FormGroup;
  public searchGlobalForm2: FormGroup;
  constructor() {
    this.searchGlobalForm = this.fb.group({
      nombre: [""],
    });
    this.searchGlobalForm2 = this.fb.group({
      nombre1: [""],
    });
    this.language = Languages[this.lanSelected];
    const storedLanId = this.session.getLanguageId();
    if (storedLanId) {
      this.language = Languages[storedLanId];
      this.lanSelected = storedLanId;
    }
    this.url = GLOBAL.url;
    // set screenWidth on page load
    this.screenWidth = window.innerWidth;
    this.grupoinfo = createGrupo();
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: Event): void {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit(): void {
    this.titleService.setTitle("GMCAN | UNMSM");
    this.getGrupoInfo();
    this.session.setLanguageData(this.language);
  }

  lanSelected = 0;

  lanSelect(number: number): void {
    this.lanSelected = number;
    this.session.setLanguageData(Languages[this.lanSelected]);
    this.session.setLanguageId(number);
    window.location.reload();
  }

  getGrupoInfo(): void {
    this._grupoService.getGrupoInfo().subscribe((res: Grupo[]) => {
      this.grupoinfo = res[0];
      this.session.setGrupoInfo(this.grupoinfo);
      this.grupoinfo.logoHeader = this.url + "grupo/" + this.grupoinfo.idGrupo + "/files/header";
      this.grupoinfo.logoFooter = this.url + "grupo/" + this.grupoinfo.idGrupo + "/files/footer";
    });
  }
  inputExpand = false;
  expandInput(): void {
    this.inputExpand = !this.inputExpand;
    if (this.inputExpand) {
      document.getElementById("inputExpand")?.setAttribute("class", "search-top-input search-top-input-decompressed");
      document.getElementById("formExpand")?.setAttribute("class", "full-width");
    } else {
      document.getElementById("inputExpand")?.setAttribute("class", "search-top-input search-top-input-compressed");
      document.getElementById("formExpand")?.setAttribute("class", "");
    }
  }

  /* globalSearch */

  searchGlobal(value: string): void {
    window.location.href = "/home/search/" + value;
  }

  loginLink(): void {
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(["/login"]);
  }

  scroll(): void {
    const el = document.getElementById("main-toolbar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }
}
