import { DatePipe, NgIf, NgFor, NgClass, SlicePipe } from "@angular/common";
import { TitleCasePipe } from "@angular/common";
import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
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
import { GrupoService } from "@app/shared/services/grupo.service";
import { PreviousPageService } from "@app/shared/services/previouspage.service";
import { PublicacionAutoresService } from "@app/shared/services/publicacion-autores.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { RevistaService } from "@app/shared/services/revista.service";
import { SearchService } from "@app/shared/services/search.service";
import { SessionService } from "@app/shared/services/session.service";
import { TipoPublicacionService } from "@app/shared/services/tipopublicacion.service";
import { TipoTesisService } from "@app/shared/services/tipotesis.service";
import { UniversidadService } from "@app/shared/services/universidad.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

@Component({
  selector: "app-publication",
  templateUrl: "./publication.component.html",
  styleUrls: ["./publication.component.scss"],
  imports: [
    NgIf,
    MatProgressSpinner,
    MatIcon,
    MatTabGroup,
    NgFor,
    MatTab,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NewsComponent,
    SlicePipe,
  ],
})
export default class PublicationComponent implements OnInit {
  public previouslink: string | null = null;
  public previouspage = "";
  public tipoPublicaciones: TipoPublicacion[];
  public publicaciones: Publicacion[] = [];
  public cargado = false;
  public allCharged: boolean | null = false;
  public searchForm: FormGroup;
  public publicacionSearch: Publicacion[] = [];
  public tipoPublicacion = 0;
  public url: string;
  infoText = "";

  constructor(
    public fb: FormBuilder,
    public titlecasePipe: TitleCasePipe,
    public datePipe: DatePipe,
    public _previousService: PreviousPageService,
    public _tipoPublicacionService: TipoPublicacionService,
    public _publicacionService: PublicacionService,
    public _revistaService: RevistaService,
    public _publicacionAutoresService: PublicacionAutoresService,
    public _usuarioService: UsuarioService,
    public _universidadService: UniversidadService,
    public _searchService: SearchService,
    public _eventoService: EventoService,
    public _tipotesisService: TipoTesisService,
    public location: Location,
    public _route: ActivatedRoute,
    public _router: Router,
    public _grupoService: GrupoService,
    private _session: SessionService,
    private titleService: Title,
  ) {
    this.tipoPublicaciones = [];
    this.searchForm = this.fb.group({
      titulo: [""],
    });
    this.url = GLOBAL.url;
  }
  language: any = {};
  selectedItem = -1;
  oldValue = -1;
  listClick(_event: Event, newValue: number): void {
    this.oldValue = this.selectedItem;
    this.selectedItem = newValue;
    const current = document.getElementById("abstract" + newValue);
    if (current) {
      current.innerText = this.language.publicationsText[0].seeLess;
    }
    if (this.selectedItem == this.oldValue) {
      this.selectedItem = -1;
      const previous = document.getElementById("abstract" + this.oldValue);
      if (previous) {
        previous.innerText = this.language.publicationsText[0].seeMore;
      }
    }
  }
  page = 1;
  pageSize = 5;
  ngOnInit(): void {
    this.language = this._session.getLanguageData<any>() ?? {};
    this.titleService.setTitle("GMCAN | " + this.language.publications);
    this.allCharged = false;
    this.previouslink = sessionStorage.getItem("previous-page");
    this.previouspage = this._previousService.getPreviousPage(this.previouslink ?? "");
    this.getTipoPublicacion();
    this.getGrupo();
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

  getGrupo(): void {
    this._grupoService.getGrupoInfo().subscribe((res: any[]) => {
      if (res.length > 0) {
        this.infoText = res[0].seccionPublicaciones;
      }
    });
  }

  scroll(): void {
    const el = document.getElementById("main-toolbar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  getTipoPublicacion(): void {
    this._tipoPublicacionService.getTipoPublicaciones().subscribe((res: TipoPublicacion[]) => {
      if (res) {
        this.tipoPublicaciones = res;
        this.getPublicaciones(this.tipoPublicaciones[0].idTipoPublicacion ?? 0);
        this.cargado = true;
      }
    });
  }

  getPublicaciones(idTipoPublicacion: number): void {
    this._publicacionService.getPublicaciones(idTipoPublicacion).subscribe((res: Publicacion[]) => {
      if (res) {
        res.sort((a: Publicacion, b: Publicacion) =>
          (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
            ? 1
            : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
              ? -1
              : 0,
        );
        this.allCharged = true;
        this.page = 1;
        this.pageSize = 5;
        this.publicaciones = res;
        for (const publicacion of this.publicaciones) {
          this.fillPublicacion(publicacion);
        }
      }
    });
  }

  getRevista(publicacion: Publicacion): void {
    this._revistaService.getRevista(publicacion.revista_idRevista ?? 0).subscribe((res: any[]) => {
      if (res && res[0] != undefined) {
        publicacion.revista = res[0].nombre;
      }
    });
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
    this._universidadService.getUniversidad(publicacion.universidad_idUniversidad ?? 0).subscribe((res: any) => {
      if (res && res[0] != undefined) {
        publicacion.universidad = res[0].nombre;
      }
    });
  }

  getPublicacion(idPublicacion: number): void {
    this._publicacionService.getPublication(idPublicacion).subscribe((res: Publicacion[]) => {
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
    this._tipotesisService.getTiposTesis().subscribe((res: any[]) => {
      if (res.length > 0) {
        for (const tipo of res) {
          if (publicacion.tipoTesis_idTipoTesis == tipo.idTipoTesis) {
            publicacion.tipoTesis = tipo.nombre;
          }
        }
      }
    });
  }

  fillPublicacion(publicacion: Publicacion): void {
    publicacion.autor = [];
    const d = new Date(publicacion.fechaPublicacion ?? "");
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    publicacion.fechaPublicacion = d.toISOString();
    publicacion.fecha = this.datePipe.transform(publicacion.fechaPublicacion, "MMMM y", "es") ?? undefined;
    publicacion.fecha = this.titlecasePipe.transform(publicacion.fecha ?? "");
    this.getUniversidad(publicacion);
    this.getRevista(publicacion);
    this._publicacionAutoresService.getForPublication(publicacion.idPublicacion ?? 0).subscribe((authors) => {
      publicacion.autor = authors;
    });
    this.getEvento(publicacion.evento_idEvento ?? 0, publicacion);
    this.getTipoTesis(publicacion);
  }

  /* Request Publicaciones at Tab Change */
  changeTab($event: { index: number }): void {
    this.publicaciones = [];
    this.allCharged = null;
    this.getPublicaciones(this.tipoPublicaciones[$event.index].idTipoPublicacion ?? 0);
    this.searchForm.controls["titulo"].setValue("");
  }

  /*  Búsqueda */
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
    this._searchService.searchPublicaciones(titulo, id).subscribe((res: Publicacion[]) => {
      this.publicacionSearch = [];
      if (res.length > 0) {
        this.publicacionSearch = res;
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
    this._publicacionService.getPublicaciones(tipoPublicacion).subscribe((res: Publicacion[]) => {
      if (res.length > 0) {
        const publicacionesFound = res;
        this._searchService.searchEventos(nombre).subscribe((searchEvents: any[]) => {
          if (searchEvents.length > 0) {
            for (const ev of searchEvents) {
              const valor = publicacionesFound.findIndex((x: Publicacion) => x.evento_idEvento === ev.idEvento);
              if (valor != -1) {
                this.getPublicacion(publicacionesFound[valor].idPublicacion ?? 0);
              }
            }
          }
        });
      }
    });
  }

  searchTipoTesis(nombre: string, tipoPublicacion: number): void {
    this._searchService.searchTipoTesis(nombre).subscribe((res: any[]) => {
      if (res.length > 0) {
        const tipoTesis = res;
        this._publicacionService.getPublicaciones(tipoPublicacion).subscribe((resPublicaciones: Publicacion[]) => {
          if (resPublicaciones.length > 0) {
            for (const pub of resPublicaciones) {
              for (const tipo of tipoTesis) {
                if (tipo.idTipoTesis === pub.tipoTesis_idTipoTesis) {
                  this.getPublicacion(pub.idPublicacion ?? 0);
                }
              }
            }
          }
        });
      }
    });
  }

  /* Fin de busqueda */

  profile(user: PublicationAuthor): void {
    if (!user.DNI) {
      return;
    }
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(["/home/detail-member/" + user.DNI]);
  }
}
