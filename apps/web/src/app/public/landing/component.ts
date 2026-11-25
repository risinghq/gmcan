import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIcon } from "@angular/material/icon";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from "@angular/material/sidenav";
import { MatToolbar } from "@angular/material/toolbar";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";
import { UiStateService } from "@app/shared/services/ui-state.service";
import { languagePath, type SiteLanguage } from "@app/shared/site-language";
import { tap } from "rxjs";

@Component({
  selector: "app-landing",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatSidenavContainer,
    MatSidenav,
    MatIcon,
    RouterLink,
    RouterLinkActive,
    MatSidenavContent,
    MatToolbar,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    RouterOutlet,
  ],
})
export default class LandingComponent {
  private router = inject(Router);
  private groupService = inject(GroupService);
  private browser = inject(BrowserService);
  private session = inject(SessionService);
  private uiState = inject(UiStateService);
  private seo = inject(SeoService);

  readonly groupInfo = toSignal(
    this.groupService.getGroup().pipe(
      tap((group) => {
        this.uiState.setGroupInfo(group);
        this.seo.setGroup(group);
      }),
    ),
    { initialValue: this.uiState.groupInfo() },
  );
  url = GLOBAL.url;
  enteredButton = false;
  isMatMenuOpen = false;
  prevButtonTrigger = false;
  language = this.session.language();
  siteLanguage = this.session.siteLanguage;

  languageHref(language: SiteLanguage): string {
    return languagePath(this.router.url, language);
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
