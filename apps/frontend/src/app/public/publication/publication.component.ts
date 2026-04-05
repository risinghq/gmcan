import { DatePipe, SlicePipe } from "@angular/common";
import { TitleCasePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import type { PublicationAuthor } from "@app/shared/models/author";
import { Publicacion } from "@app/shared/models/publicacion";
import { TipoPublicacion } from "@app/shared/models/tipopublicacion";
import { EventoService } from "@app/shared/services/evento.service";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { NavigationHistoryService } from "@app/shared/services/navigation-history.service";
import { PreviousPageService } from "@app/shared/services/previouspage.service";
import { PublicacionAutoresService } from "@app/shared/services/publicacion-autores.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { SearchService } from "@app/shared/services/search.service";
import { SessionService } from "@app/shared/services/session.service";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

import type { PublicationViewModel } from "./publication-data.types";

@Component({
  selector: "app-publication",
  templateUrl: "./publication.component.html",
  styleUrl: "./publication.component.scss",
  imports: [
    MatProgressSpinner,
    MatIcon,
    MatTabGroup,
    MatTab,
    FormsModule,
    ReactiveFormsModule,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NewsComponent,
    SlicePipe,
  ],
})
export default class PublicationComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _titlecasePipe = inject(TitleCasePipe);
  private readonly _datePipe = inject(DatePipe);
  private readonly _navigationHistory = inject(NavigationHistoryService);
  private readonly _previousService = inject(PreviousPageService);
  private readonly _lookup = inject(LookupService);
  private readonly _publicacionService = inject(PublicacionService);
  private readonly _publicacionAutoresService = inject(PublicacionAutoresService);
  private readonly _searchService = inject(SearchService);
  private readonly _eventoService = inject(EventoService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _session = inject(SessionService);
  private readonly _titleService = inject(Title);

  previouslink: string | null = null;
  previouspage = "";
  tipoPublicaciones: TipoPublicacion[] = [];
  publicaciones: Publicacion[] = [];
  cargado = false;
  allCharged: boolean | null = false;
  searchForm: FormGroup;
  publicacionSearch: Publicacion[] = [];
  tipoPublicacion = 0;
  url = GLOBAL.url;
  infoText = "";
  language: any = {};
  expandedKey: string | null = null;
  page = 1;
  pageSize = 5;

  constructor() {
    this.searchForm = this._fb.group({
      titulo: [""],
    });
  }

  ngOnInit(): void {
    this.language = this._session.language();
    this._titleService.setTitle("GMCAN | " + this.language.publications);

    const pubData = this._route.snapshot.data["publications"] as PublicationViewModel;
    this.tipoPublicaciones = pubData.tipoPublicaciones.map((t) => Object.assign({}, t) as TipoPublicacion);
    this.infoText = pubData.infoText;

    if (this.tipoPublicaciones.length > 0) {
      const initialTipo = this.tipoPublicaciones[0].idTipoPublicacion ?? 0;
      const initialPublicaciones = pubData.publicaciones.filter(
        (publicacion) => publicacion.tipoPublicacion_idTipoPublicacion === initialTipo,
      );
      this._applyPublicationList(initialPublicaciones);
      this.cargado = true;
    }

    this.previouslink = this._navigationHistory.previousUrl();
    this.previouspage = this._previousService.getPreviousPage(this.previouslink ?? "");
  }

  ngDoCheck(): void {
    if (this.tipoPublicaciones && this.tipoPublicaciones[0]) {
      this.tipoPublicaciones[0].nombreTab = this.language.publicationsText[0].nameTab1;
      this.tipoPublicaciones[1].nombreTab = this.language.publicationsText[0].nameTab2;
      this.tipoPublicaciones[2].nombreTab = this.language.publicationsText[0].nameTab3;
      this.tipoPublicaciones[0].search = this.language.publicationsText[0].search1;
      this.tipoPublicaciones[1].search = this.language.publicationsText[0].search2;
      this.tipoPublicaciones[2].search = this.language.publicationsText[0].search3;
    }
  }

  scroll(): void {
    const el = document.getElementById("main-toolbar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  getPublicaciones(idTipoPublicacion: number): void {
    this._publicacionService.getPublicaciones(idTipoPublicacion).subscribe((res: Publicacion[]) => {
      this._applyPublicationList(res ?? []);
    });
  }

  private _applyPublicationList(publicaciones: Publicacion[]): void {
    const ordered = publicaciones.toSorted((a: Publicacion, b: Publicacion) =>
      (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
        ? 1
        : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
          ? -1
          : 0,
    );

    this.allCharged = true;
    this.page = 1;
    this.pageSize = 5;
    this.publicaciones = ordered;
    for (const publicacion of this.publicaciones) {
      this.fillPublicacion(publicacion);
    }
  }

  getRevista(publicacion: Publicacion): void {
    const found = this._lookup.revistas().find((r) => r.idRevista === publicacion.revista_idRevista);
    if (found) publicacion.revista = found.nombre;
  }

  getEvento(idEvento: number, publicacion: Publicacion): void {
    this._eventoService.getEvento(idEvento).subscribe((res: any[]) => {
      if (res.length > 0) {
        publicacion.evento = res[0].nombre;
        publicacion.ciudad = res[0].ciudad;
        publicacion.pais = res[0].pais;
      }
    });
  }

  getUniversidad(publicacion: Publicacion): void {
    const found = this._lookup.universidades().find((u) => u.idUniversidad === publicacion.universidad_idUniversidad);
    if (found) publicacion.universidad = found.nombre ?? "";
  }

  getPublicacion(idPublicacion: number): void {
    this._publicacionService.getPublication(idPublicacion).subscribe((res) => {
      if (res.length > 0) {
        for (const pub of res) {
          if (this.publicacionSearch.findIndex((x: Publicacion) => x.idPublicacion === pub.idPublicacion) == -1) {
            this.publicacionSearch.push(pub);
          }
        }
      }
      for (let index = this.publicacionSearch.length - 1; index >= 0; index--) {
        if (this.publicacionSearch[index].tipoPublicacion_idTipoPublicacion != this.tipoPublicacion) {
          this.publicacionSearch.splice(index, 1);
        }
      }
      this.publicaciones = this.publicacionSearch;
      for (const publicacion of this.publicaciones) {
        this.fillPublicacion(publicacion);
      }
    });
  }

  getTipoTesis(publicacion: Publicacion): void {
    const found = this._lookup.tiposTesis().find((t) => t.idTipoTesis === publicacion.tipoTesis_idTipoTesis);
    if (found) publicacion.tipoTesis = found.nombre;
  }

  fillPublicacion(publicacion: Publicacion): void {
    publicacion.autor = [];
    const d = new Date(publicacion.fechaPublicacion ?? "");
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    publicacion.fechaPublicacion = d.toISOString();
    publicacion.fecha = this._datePipe.transform(publicacion.fechaPublicacion, "MMMM y", "es") ?? undefined;
    publicacion.fecha = this._titlecasePipe.transform(publicacion.fecha ?? "");
    this.getUniversidad(publicacion);
    this.getRevista(publicacion);
    this._publicacionAutoresService.getForPublication(publicacion.idPublicacion ?? 0).subscribe((authors) => {
      publicacion.autor = authors;
    });
    this.getEvento(publicacion.evento_idEvento ?? 0, publicacion);
    this.getTipoTesis(publicacion);
  }

  changeTab($event: { index: number }): void {
    this.publicaciones = [];
    this.allCharged = null;
    this.getPublicaciones(this.tipoPublicaciones[$event.index].idTipoPublicacion ?? 0);
    this.searchForm.controls["titulo"].setValue("");
  }

  search(value: string, id: number | undefined): void {
    this.publicaciones = [];
    this.allCharged = false;
    if (value != "") {
      this.searchPublicaciones(value, id ?? 0);
    } else {
      this.getPublicaciones(id ?? 0);
    }
  }

  searchPublicaciones(titulo: string, id: number): void {
    this.tipoPublicacion = id;
    this.publicacionSearch = [];
    this._searchService.search(titulo, ["publications"]).subscribe((results) => {
      const filtered = results.publications.filter((p) => p.tipoPublicacion_idTipoPublicacion === id);
      for (const pub of filtered) {
        this.getPublicacion(pub.idPublicacion);
      }
      this.searchByAuthors(titulo);
      if (id === 3) {
        this.searchEventos(titulo, id);
      }
      if (id === 2) {
        this.searchTipoTesis(titulo, id);
      }
      this.allCharged = true;
    });
  }

  searchByAuthors(nombre: string): void {
    this._publicacionAutoresService.searchPublications(nombre).subscribe((res) => {
      for (const item of res) {
        this.getPublicacion(item.publicacion_idPublicacion);
      }
    });
  }

  searchEventos(nombre: string, tipoPublicacion: number): void {
    const matchingEvents = this._lookup.eventos().filter((e) => e.nombre.toLowerCase().includes(nombre.toLowerCase()));
    if (matchingEvents.length > 0) {
      this._publicacionService.getPublicaciones(tipoPublicacion).subscribe((res: Publicacion[]) => {
        for (const ev of matchingEvents) {
          const found = res.find((x) => x.evento_idEvento === ev.idEvento);
          if (found) this.getPublicacion(found.idPublicacion ?? 0);
        }
      });
    }
  }

  searchTipoTesis(nombre: string, tipoPublicacion: number): void {
    const matchingTypes = this._lookup
      .tiposTesis()
      .filter((t) => t.nombre.toLowerCase().includes(nombre.toLowerCase()));
    if (matchingTypes.length > 0) {
      this._publicacionService.getPublicaciones(tipoPublicacion).subscribe((res: Publicacion[]) => {
        for (const pub of res) {
          if (matchingTypes.some((t) => t.idTipoTesis === pub.tipoTesis_idTipoTesis)) {
            this.getPublicacion(pub.idPublicacion ?? 0);
          }
        }
      });
    }
  }

  /* Fin de busqueda */

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

  profile(user: PublicationAuthor): void {
    if (!user.DNI) {
      return;
    }
    this._router.navigate(["/home/detail-member/" + user.DNI]);
  }
}
