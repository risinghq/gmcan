import { Component, OnInit, HostListener, inject } from "@angular/core";
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from "@angular/material/sidenav";
import { MatToolbar } from "@angular/material/toolbar";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { createGroup } from "@app/shared/models/factories";
import type { Group } from "@app/shared/models/group";
import { Languages } from "@app/shared/models/languages";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
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
  _groupService = inject(GroupService);
  private browser = inject(BrowserService);
  private session = inject(SessionService);
  fb = inject(FormBuilder);
  private titleService = inject(Title);

  screenWidth: number;
  public grupoinfo: Group;
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
    this.screenWidth = this.browser.innerWidth();
    this.grupoinfo = createGroup();
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: Event): void {
    this.screenWidth = this.browser.innerWidth();
  }

  ngOnInit(): void {
    this.titleService.setTitle("GMCAN | UNMSM");
    this.getGroupInfo();
  }

  lanSelected = 0;

  lanSelect(number: number): void {
    this.lanSelected = number;
    this.language = Languages[this.lanSelected] ?? Languages[0];
    this.session.setLanguage(this.language, number);
    this.browser.reload();
  }

  getGroupInfo(): void {
    this._groupService.getGroup().subscribe((group: Group) => {
      this.grupoinfo = group;
      this.grupoinfo.logoHeader = this.url + "api/group/files/header";
      this.grupoinfo.logoFooter = this.url + "api/group/files/footer";
      this.session.setGroupInfo(this.grupoinfo);
    });
  }

  inputExpand = false;

  expandInput(): void {
    this.inputExpand = !this.inputExpand;
  }

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
