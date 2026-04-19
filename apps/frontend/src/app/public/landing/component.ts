import { Component, OnInit, HostListener, inject } from "@angular/core";
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
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { GrupoService } from "@app/shared/services/grupo.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-landing",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
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
  _grupoService = inject(GrupoService);
  private browser = inject(BrowserService);
  private session = inject(SessionService);
  fb = inject(FormBuilder);
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
    this.lanSelected = this.session.languageId();
    this.language = this.session.language();
    this.url = GLOBAL.url;
    // set screenWidth on page load
    this.screenWidth = this.browser.innerWidth();
    this.grupoinfo = createGrupo();
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: Event): void {
    this.screenWidth = this.browser.innerWidth();
  }

  ngOnInit(): void {
    this.titleService.setTitle("GMCAN | UNMSM");
    this.getGrupoInfo();
  }

  lanSelected = 0;

  lanSelect(number: number): void {
    this.lanSelected = number;
    this.language = Languages[this.lanSelected] ?? Languages[0];
    this.session.setLanguage(this.language, number);
    this.browser.reload();
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
  }

  /* globalSearch */

  searchGlobal(value: string): void {
    this._router.navigate(["/home/search/" + value]);
  }

  loginLink(): void {
    this._router.navigate(["/login"]);
  }

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }
}
