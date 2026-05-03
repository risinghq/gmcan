import { Component, OnInit, HostListener, inject } from "@angular/core";
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from "@angular/material/sidenav";
import { MatToolbar } from "@angular/material/toolbar";
import { Title } from "@angular/platform-browser";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { createGroup } from "@app/shared/models/factories";
import type { Group } from "@app/shared/models/group";
import { Languages } from "@app/shared/models/languages";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { SessionService } from "@app/shared/services/session.service";
import { UiStateService } from "@app/shared/services/ui-state.service";

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
  private router = inject(Router);
  private groupService = inject(GroupService);
  private browser = inject(BrowserService);
  private session = inject(SessionService);
  private uiState = inject(UiStateService);
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
    this.groupService.getGroup().subscribe((group: Group) => {
      this.grupoinfo = group;
      this.grupoinfo.logoHeader = this.url + "api/group/files/header";
      this.grupoinfo.logoFooter = this.url + "api/group/files/footer";
      this.uiState.setGroupInfo(this.grupoinfo);
    });
  }

  inputExpand = false;

  expandInput(): void {
    this.inputExpand = !this.inputExpand;
  }

  searchGlobal(value: string): void {
    this.router.navigate(["/home/search/" + value], { queryParams: { from: "home" } });
  }

  loginLink(): void {
    this.router.navigate(["/login"]);
  }

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }
}
