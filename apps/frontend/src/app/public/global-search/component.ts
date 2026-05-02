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
  private readonly titlecasePipe = inject(TitleCasePipe);
  private readonly datePipe = inject(DatePipe);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly lookup = inject(LookupService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly session = inject(SessionService);
  private readonly browser = inject(BrowserService);
  private readonly titleService = inject(Title);
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly destroyRef = inject(DestroyRef);

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

  private publicationTypeById = new Map<number, string>();
  private thesisTypeById = new Map<number, string>();
  private journalById = new Map<number, string>();
  private universityById = new Map<number, string>();
  private eventById = new Map<number, { name: string; city: string | null; country: string | null }>();
  private currencyById = new Map<number, string>();
  private newsTypeById = new Map<number, string>();

  constructor() {
    this.searchGlobalForm = this.formBuilder.group({
      nombre: [""],
    });
  }

  ngOnInit(): void {
    this.language = this.session.language();
    this.buildLookupMaps();

    const searchData = this.route.snapshot.data["search"] as GlobalSearchViewModel;
    this.proyectos = [...searchData.projects];
    this.publicaciones = [...searchData.publications];
    this.miembros = [...searchData.members];
    this.noticias = [...searchData.news];

    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params: Params) => {
      const nombre = params["id"];
      this.searchId = nombre;
      this.titleService.setTitle("GMCAN | " + nombre);
      this.searchGlobalForm.controls["nombre"].setValue(nombre);
    });

    for (const proyecto of this.proyectos) this.fillProyecto(proyecto);
    for (const publicacion of this.publicaciones) this.fillPublicacion(publicacion);
    for (const noticia of this.noticias) this.fillNoticia(noticia);

    this.previouslink = this.navigationHistory.previousUrl();
  }

  searchGlobal(value: string): void {
    this.router.navigate(["/home/search/" + value]);
  }

  fillProyecto(proyecto: ProjectDisplay): void {
    proyecto.moneda = this.currencyById.get(proyecto.currencyId ?? -1);

    const start = this.normalizedDate(proyecto.startDate);
    if (start) {
      proyecto.fechaI = this.titlecasePipe.transform(this.datePipe.transform(start, "MMMM, y", "es") ?? "");
    }

    if (proyecto.endDate) {
      const end = this.normalizedDate(proyecto.endDate);
      if (end) proyecto.fechaF = this.titlecasePipe.transform(this.datePipe.transform(end, "MMMM, y", "es") ?? "");
    }
  }

  fillPublicacion(pub: PublicationDisplay): void {
    pub.tipoPublicacion = this.publicationTypeById.get(pub.typeId ?? -1);
    pub.revista = this.journalById.get(pub.journalId ?? -1);
    pub.universidad = this.universityById.get(pub.universityId ?? -1) ?? undefined;
    pub.tipoTesis = this.thesisTypeById.get(pub.thesisTypeId ?? -1);
    const evento = this.eventById.get(pub.eventId ?? -1);
    pub.evento = evento?.name;
    pub.ciudad = evento?.city ?? null;
    pub.pais = evento?.country ?? null;
    const publishedAt = this.normalizedDate(pub.publishedAt);
    pub.fecha = publishedAt
      ? this.titlecasePipe.transform(this.datePipe.transform(publishedAt, "MMMM y", "es") ?? "")
      : "";
  }

  fillNoticia(noticia: NewsDisplay): void {
    noticia.nombreTipoNoticia = this.newsTypeById.get(noticia.newsTypeId ?? -1);
    const publishedAt = this.normalizedDate(noticia.publishedAt);
    if (publishedAt) noticia.fechaFormateada = this.datePipe.transform(publishedAt, "MM/dd/y", "es") ?? undefined;
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
    this.browser.scrollIntoViewById("main-toolbar");
  }

  profile(member: MemberDisplay): void {
    this.router.navigate(["/home/detail-member/" + member.id]);
  }

  detalleNoticia(noticia: { id: number }): void {
    this.router.navigate(["/home/detail-news/" + noticia.id]);
  }

  return(): void {
    if (this.previouslink) {
      this.router.navigate([this.previouslink]);
      return;
    }
    this.router.navigate(["/home"]);
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

  private buildLookupMaps(): void {
    this.publicationTypeById = new Map(this.lookup.publicationTypes().map((item) => [item.id, item.name]));
    this.thesisTypeById = new Map(this.lookup.thesisTypes().map((item) => [item.id, item.name]));
    this.journalById = new Map(this.lookup.journals().map((item) => [item.id, item.name]));
    this.universityById = new Map(this.lookup.universities().map((item) => [item.id, item.name]));
    this.eventById = new Map(
      this.lookup
        .events()
        .map((item) => [item.id, { name: item.name, city: item.city ?? null, country: item.country ?? null }]),
    );
    this.currencyById = new Map(this.lookup.monedas().map((item) => [item.idMoneda, item.simbolo]));
    this.newsTypeById = new Map(this.lookup.newsTypes().map((item) => [item.id, item.name]));
  }

  private normalizedDate(value: string | null | undefined): Date | null {
    const date = new Date(value ?? "");
    if (Number.isNaN(date.getTime())) return null;
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date;
  }
}
