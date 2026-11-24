import { Component, HostListener, inject, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { Router, RouterOutlet } from "@angular/router";
import type { Group } from "@app/shared/models/group";
import { Languages } from "@app/shared/models/languages";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";
import { UiStateService } from "@app/shared/services/ui-state.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet],
})
export default class AppComponent {
  private groupService = inject(GroupService);
  private session = inject(SessionService);
  private uiState = inject(UiStateService);
  private browser = inject(BrowserService);
  fb = inject(FormBuilder);
  private router = inject(Router);
  private seo = inject(SeoService);

  screenWidth: number;
  public url: string;
  enteredButton = false;
  isMatMenuOpen = false;
  prevButtonTrigger = false;
  language: (typeof Languages)[number];
  lanSelected: number;
  public searchGlobalForm: FormGroup;
  constructor() {
    this.searchGlobalForm = this.fb.group({
      nombre: [""],
    });
    this.lanSelected = this.session.languageId();
    this.language = this.session.language();
    this.url = GLOBAL.url;
    this.seo.setOpenGraphLocation(GLOBAL.appUrl, GLOBAL.app("img/gmcan.jpg"));
    this.screenWidth = this.browser.innerWidth();
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: UIEvent): void {
    this.screenWidth = this.browser.innerWidth();
  }

  ngOnInit(): void {
    this.getGroupInfo();
  }

  lanSelect(index: number): void {
    this.lanSelected = index;
    this.language = Languages[this.lanSelected] ?? Languages[0];
    this.session.setLanguage(this.language, index);
    this.browser.reload();
  }

  getGroupInfo(): void {
    this.groupService.getGroup().subscribe((res: Group) => this.uiState.setGroupInfo(res));
  }
  searchGlobal(value: string): void {
    this.router.navigate(["/search/" + value]);
  }
}
