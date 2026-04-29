import { DatePipe, SlicePipe, TitleCasePipe } from "@angular/common";
import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Params, Router } from "@angular/router";
import type { SearchResults } from "@app/shared/models/search-results";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { NavigationHistoryService } from "@app/shared/services/navigation-history.service";
import { SessionService } from "@app/shared/services/session.service";
import {
  NgbPagination,
  NgbPaginationNext,
  NgbPaginationNumber,
  NgbPaginationPrevious,
} from "@ng-bootstrap/ng-bootstrap/pagination";

import type { GlobalSearchViewModel } from "./types";

type ProjectDisplay = SearchResults["projects"][number] & { fechaI?: string; fechaF?: string; moneda?: string };
type PublicationDisplay = SearchResults["publications"][number] & {
  fecha?: string;
  tipoPublicacion?: string;
  tipoTesis?: string;
  revista?: string;
  universidad?: string;
  evento?: string;
  ciudad?: string | null;
  pais?: string | null;
};
type NewsDisplay = SearchResults["news"][number] & { nombreTipoNoticia?: string; fechaFormateada?: string };
type MemberDisplay = SearchResults["members"][number];

@Component({
  selector: "app-global-search",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    SlicePipe,
  ],
})
export default class GlobalSearchComponent implements OnInit {
  private readonly _titlecasePipe = inject(TitleCasePipe);
  private readonly _datePipe = inject(DatePipe);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _lookup = inject(LookupService);
  private readonly _fb = inject(FormBuilder);
  private readonly _session = inject(SessionService);
  private readonly _browser = inject(BrowserService);
  private readonly _titleService = inject(Title);
  private readonly _navigationHistory = inject(NavigationHistoryService);
  private readonly _destroyRef = inject(DestroyRef);

  proyectos: ProjectDisplay[] = [];
  publicaciones: PublicationDisplay[] = [];
  miembros: MemberDisplay[] = [];
  noticias: NewsDisplay[] = [];
  language: any = {};
  searchGlobalForm: FormGroup;
  page1 = 1;
  page2 = 1;
  pageSize = 5;
  url = GLOBAL.url;
  previouslink: string | null = null;
  searchId = "";
  expandedKey: string | null = null;
  publicationExpanded = true;
  projectExpanded = true;
  memberExpanded = true;
  newsExpanded = true;

  constructor() {
    this.searchGlobalForm = this._fb.group({
      nombre: [""],
    });
  }

  ngOnInit(): void {
    this.language = this._session.language();

    const searchData = this._route.snapshot.data["search"] as GlobalSearchViewModel;
    this.proyectos = [...searchData.projects];
    this.publicaciones = [...searchData.publications];
    this.miembros = [...searchData.members];
    this.noticias = [...searchData.news];

    this._route.params.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((params: Params) => {
      const nombre = params["id"];
      this.searchId = nombre;
      this._titleService.setTitle("GMCAN | " + nombre);
      this.searchGlobalForm.controls["nombre"].setValue(nombre);
    });

    for (const proyecto of this.proyectos) this.fillProyecto(proyecto);
    for (const publicacion of this.publicaciones) this.fillPublicacion(publicacion);
    for (const noticia of this.noticias) this.fillNoticia(noticia);

    this.previouslink = this._navigationHistory.previousUrl();
  }

  searchGlobal(value: string): void {
    this._router.navigate(["/home/search/" + value]);
  }

  fillProyecto(proyecto: ProjectDisplay): void {
    const moneda = this._lookup.monedas().find((m) => m.idMoneda === proyecto.currencyId);
    if (moneda) proyecto.moneda = moneda.simbolo;

    const start = new Date(proyecto.startDate ?? "");
    if (String(start) !== "Invalid Date") {
      start.setMinutes(start.getMinutes() + start.getTimezoneOffset());
      proyecto.fechaI = this._titlecasePipe.transform(this._datePipe.transform(start, "MMMM, y", "es") ?? "");
    }

    if (proyecto.endDate) {
      const end = new Date(proyecto.endDate);
      if (String(end) !== "Invalid Date") {
        end.setMinutes(end.getMinutes() + end.getTimezoneOffset());
        proyecto.fechaF = this._titlecasePipe.transform(this._datePipe.transform(end, "MMMM, y", "es") ?? "");
      }
    }
  }

  fillPublicacion(pub: PublicationDisplay): void {
    pub.tipoPublicacion = this._lookup.publicationTypes().find((t) => t.id === pub.typeId)?.name;
    pub.revista = this._lookup.journals().find((j) => j.id === pub.journalId)?.name;
    pub.universidad = this._lookup.universities().find((u) => u.id === pub.universityId)?.name ?? undefined;
    pub.tipoTesis = this._lookup.thesisTypes().find((t) => t.id === pub.thesisTypeId)?.name;
    const evento = this._lookup.events().find((e) => e.id === pub.eventId);
    pub.evento = evento?.name;
    pub.ciudad = evento?.city ?? null;
    pub.pais = evento?.country ?? null;
    const d = new Date(pub.publishedAt ?? "");
    if (String(d) !== "Invalid Date") {
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    }
    pub.fecha = this._titlecasePipe.transform(this._datePipe.transform(d, "MMMM y", "es") ?? "");
  }

  fillNoticia(noticia: NewsDisplay): void {
    noticia.nombreTipoNoticia = this._lookup.newsTypes().find((t) => t.id === noticia.newsTypeId)?.name;
    const d = new Date(noticia.publishedAt ?? "");
    if (String(d) !== "Invalid Date") {
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      noticia.fechaFormateada = this._datePipe.transform(d, "MM/dd/y", "es") ?? undefined;
    }
  }

  toggleExpanded(section: string, index: number): void {
    const key = `${section}:${index}`;
    this.expandedKey = this.expandedKey === key ? null : key;
  }

  isExpanded(section: string, index: number): boolean {
    return this.expandedKey === `${section}:${index}`;
  }

  expandLabel(section: string, index: number, seeMore: string, seeLess: string): string {
    return this.isExpanded(section, index) ? seeLess : seeMore;
  }

  scroll(): void {
    this._browser.scrollIntoViewById("main-toolbar");
  }

  profile(member: MemberDisplay): void {
    this._router.navigate(["/home/detail-member/" + member.id]);
  }

  detalleNoticia(noticia: { id: number }): void {
    this._router.navigate(["/home/detail-news/" + noticia.id]);
  }

  return(): void {
    if (this.previouslink) {
      this._router.navigate([this.previouslink]);
      return;
    }
    this._router.navigate(["/home"]);
  }

  toggleRotation(caso: number): void {
    switch (caso) {
      case 1:
        this.publicationExpanded = !this.publicationExpanded;
        break;
      case 2:
        this.projectExpanded = !this.projectExpanded;
        break;
      case 3:
        this.memberExpanded = !this.memberExpanded;
        break;
      case 4:
        this.newsExpanded = !this.newsExpanded;
        break;
      default:
        break;
    }
  }
}
