import { Component, Renderer2, HostListener, inject } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { createGrupo } from "@app/shared/models/factories";
import type { Grupo } from "@app/shared/models/grupo";
import { Languages } from "@app/shared/models/languages";
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
  private ren = inject(Renderer2);
  _grupoService = inject(GrupoService);
  private session = inject(SessionService);
  fb = inject(FormBuilder);
  private router = inject(Router);

  screenWidth: number;
  public grupoinfo: Grupo;
  public url: string;
  enteredButton = false;
  isMatMenuOpen = false;
  prevButtonTrigger = false;
  language: (typeof Languages)[number];
  lanSelected = 0;
  public searchGlobalForm: FormGroup;
  constructor() {
    this.searchGlobalForm = this.fb.group({
      nombre: [""],
    });
    this.lanSelected = this.session.getLanguageId();
    this.language = Languages[this.lanSelected] ?? Languages[0];
    this.url = GLOBAL.url;
    // set screenWidth on page load
    this.screenWidth = window.innerWidth;
    this.grupoinfo = createGrupo();
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: UIEvent): void {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit(): void {
    console.log(this.session.locale);
    this.getGrupoInfo();
    this.session.setLanguageData(this.language);
    this.verifyLocale(this.language);
  }

  verifyLocale(language: { locale?: string }): void {
    if (language.locale == "en") {
      this.english();
    } else {
      this.spanish();
    }
  }

  english(): void {
    console.log("hola");
    this.session.registerCulture("en-US");
  }

  spanish(): void {
    this.session.registerCulture("es-Ar");
  }

  lanSelect(index: number): void {
    this.lanSelected = index;
    this.language = Languages[this.lanSelected] ?? Languages[0];
    this.verifyLocale(this.language);
    this.session.setLanguageData(this.language);
    this.session.setLanguageId(index);
    window.location.reload();
  }

  getGrupoInfo(): void {
    this._grupoService.getGrupoInfo().subscribe((res: Grupo[]) => {
      this.grupoinfo = res[0];
      this.session.setGrupoInfo(this.grupoinfo);
      this.grupoinfo.logoHeader = this.url + "grupo/get-image-grupo/" + this.grupoinfo.logoHeader;
    });
  }
  inputExpand = false;
  expandInput(): void {
    this.inputExpand = !this.inputExpand;
    const inputElement = document.getElementById("inputExpand");
    if (!inputElement) return;
    if (this.inputExpand) {
      inputElement.setAttribute("class", "search-top-input search-top-input-decompressed");
    } else {
      inputElement.setAttribute("class", "search-top-input search-top-input-compressed");
    }
  }

  /* globalSearch */

  searchGlobal(value: string): void {
    this._router.navigate(["/search/" + value]);
  }
}
