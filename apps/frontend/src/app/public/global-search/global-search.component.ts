import { DatePipe, SlicePipe, TitleCasePipe } from "@angular/common";
import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { Noticia } from "@app/shared/models/noticia";
import { Proyecto } from "@app/shared/models/proyecto";
import { Publicacion } from "@app/shared/models/publicacion";
import { TipoNoticia } from "@app/shared/models/tiponoticia";
import { TipoPublicacion } from "@app/shared/models/tipopublicacion";
import { UsuarioFull } from "@app/shared/models/usuarioFull";
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

import type { GlobalSearchViewModel } from "./global-search-data.types";

@Component({
  selector: "app-global-search",
  templateUrl: "./global-search.component.html",
  styleUrl: "./global-search.component.scss",
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
  private readonly _titleService = inject(Title);
  private readonly _navigationHistory = inject(NavigationHistoryService);
  private readonly _destroyRef = inject(DestroyRef);

  proyectos: Proyecto[] = [];
  publicaciones: Publicacion[] = [];
  miembros: UsuarioFull[] = [];
  noticias: Noticia[] = [];
  tipoPublicaciones: TipoPublicacion[] = [];
  tiponoticias: TipoNoticia[] = [];
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
    this.proyectos = searchData.projects;
    this.publicaciones = searchData.publications;
    this.miembros = searchData.members;
    this.noticias = searchData.news;

    this.tipoPublicaciones = [...this._lookup.tiposPublicacion()];
    this.tiponoticias = [...this._lookup.tiposNoticia()];

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

  fillProyecto(proyecto: Proyecto): void {
    // Search payload already includes the research line label.
    if (proyecto.lineasInvestigacion == null) {
      proyecto.lineasInvestigacion = "";
    }

    const moneda = this._lookup.monedas().find((item) => item.idMoneda === proyecto.moneda_idMoneda);
    if (moneda) proyecto.moneda = moneda.simbolo;

    const fechaInicio = new Date(proyecto.fechaInicio ?? new Date());
    fechaInicio.setMinutes(fechaInicio.getMinutes() + fechaInicio.getTimezoneOffset());
    proyecto.fechaI = this._datePipe.transform(fechaInicio, "MMMM, y", "es") ?? undefined;
    proyecto.fechaI = this._titlecasePipe.transform(proyecto.fechaI ?? "");

    if (proyecto.fechaFin) {
      const fechaFin = new Date(proyecto.fechaFin);
      fechaFin.setMinutes(fechaFin.getMinutes() + fechaFin.getTimezoneOffset());
      proyecto.fechaF = this._datePipe.transform(fechaFin, "MMMM, y", "es") ?? undefined;
      proyecto.fechaF = this._titlecasePipe.transform(proyecto.fechaF ?? "");
    }
  }

  fillPublicacion(publicacion: Publicacion): void {
    publicacion.tipoPublicacion = this.tipoPublicaciones.find(
      (item) => item.idTipoPublicacion === publicacion.tipoPublicacion_idTipoPublicacion,
    )?.nombre;
    publicacion.revista = this._lookup
      .revistas()
      .find((item) => item.idRevista === publicacion.revista_idRevista)?.nombre;
    publicacion.universidad =
      this._lookup.universidades().find((item) => item.idUniversidad === publicacion.universidad_idUniversidad)
        ?.nombre ?? undefined;
    publicacion.tipoTesis = this._lookup
      .tiposTesis()
      .find((item) => item.idTipoTesis === publicacion.tipoTesis_idTipoTesis)?.nombre;

    const fechaPublicacion = new Date(publicacion.fechaPublicacion ?? "");
    fechaPublicacion.setMinutes(fechaPublicacion.getMinutes() + fechaPublicacion.getTimezoneOffset());
    publicacion.fecha = this._datePipe.transform(fechaPublicacion, "MMMM y", "es") ?? undefined;
    publicacion.fecha = this._titlecasePipe.transform(publicacion.fecha ?? "");
  }

  fillNoticia(noticia: Noticia): void {
    noticia.nombreTipoNoticia = this.tiponoticias.find(
      (item) => item.idtipoNoticia === noticia.tipoNoticia_idtipoNoticia,
    )?.nombre;

    const fechaPublicacion = new Date(noticia.fechaPublicacion ?? "");
    fechaPublicacion.setMinutes(fechaPublicacion.getMinutes() + fechaPublicacion.getTimezoneOffset());
    noticia.fechaPublicacion = this._datePipe.transform(fechaPublicacion, "MM/dd/y", "es") ?? undefined;
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
    const element = document.getElementById("main-toolbar");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  }

  profile(user: { DNI?: string }): void {
    if (!user.DNI) return;
    this._router.navigate(["/home/detail-member/" + user.DNI]);
  }

  detalleNoticia(noticia: { idNoticia?: number }): void {
    if (!noticia.idNoticia) return;
    this._router.navigate(["/home/detail-news/" + noticia.idNoticia]);
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
