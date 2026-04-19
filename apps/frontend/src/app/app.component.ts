import { Component, HostListener, inject } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { createGrupo } from "@app/shared/models/factories";
import type { Grupo } from "@app/shared/models/grupo";
import { Languages } from "@app/shared/models/languages";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { GrupoService } from "@app/shared/services/grupo.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  imports: [RouterOutlet],
})
export default class AppComponent {
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _grupoService = inject(GrupoService);
  private session = inject(SessionService);
  private browser = inject(BrowserService);
  fb = inject(FormBuilder);
  private router = inject(Router);

  screenWidth: number;
  public grupoinfo: Grupo;
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
    // set screenWidth on page load
    this.screenWidth = this.browser.innerWidth();
    this.grupoinfo = createGrupo();
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: UIEvent): void {
    this.screenWidth = this.browser.innerWidth();
  }

  ngOnInit(): void {
    this.getGrupoInfo();
  }

  lanSelect(index: number): void {
    this.lanSelected = index;
    this.language = Languages[this.lanSelected] ?? Languages[0];
    this.session.setLanguage(this.language, index);
    this.browser.reload();
  }

  getGrupoInfo(): void {
    this._grupoService.getGrupoInfo().subscribe((res: Grupo[]) => {
      this.grupoinfo = res[0];
      this.session.setGrupoInfo(this.grupoinfo);
      this.grupoinfo.logoHeader = this.url + "grupo/" + this.grupoinfo.idGrupo + "/files/header";
    });
  }
  searchGlobal(value: string): void {
    this._router.navigate(["/search/" + value]);
  }
}
