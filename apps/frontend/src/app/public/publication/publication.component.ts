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
import { Autor } from "@app/shared/models/autores";
import { Publicacion } from "@app/shared/models/publicacion";
import { TipoPublicacion } from "@app/shared/models/tipopublicacion";
import { Usuario } from "@app/shared/models/usuario";
import { AutorService } from "@app/shared/services/autor.service";
import { EventoService } from "@app/shared/services/evento.service";
import { GLOBAL } from "@app/shared/services/global";
import { GrupoService } from "@app/shared/services/grupo.service";
import { PreviousPageService } from "@app/shared/services/previouspage.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { PublicacionHasAutorService } from "@app/shared/services/publicacionhasautor.service";
import { PublicacionHasUsuarioService } from "@app/shared/services/publicacionhasusuario.service";
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
  public autores: Autor[];
  public usuarios: Usuario[];
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
    public _autorService: AutorService,
    public _publicacionhasautorService: PublicacionHasAutorService,
    public _publicacionhasusuarioService: PublicacionHasUsuarioService,
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
    this.autores = [];
    this.usuarios = [];
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
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index], index);
        }
      }
    });
  }

  getRevista(publicacion: Publicacion): void {
    this._revistaService.getRevista(publicacion.revista_idRevista ?? 0).subscribe((res: any[]) => {
      if (res) {
        if (res[0] != undefined) {
          publicacion.revista = res[0].nombre;
        }
      }
    });
  }

  getUsuario(idUser: string, i: number, isPrincipal: number): void {
    this._usuarioService.getUser(idUser).subscribe((res: any[]) => {
      if (res[0] != undefined) {
        res[0].nombre = res[0].nombre.slice(0, 1) + ".";
        res[0].isPrincipal = isPrincipal;
        if (this.publicaciones[i] != undefined) {
          if (this.publicaciones[i].usuario?.findIndex((x: any) => x.DNI === res[0].DNI) == -1) {
            this.publicaciones[i].usuario.push(res[0]);
          }
          this.publicaciones[i].usuario?.sort((a: any, b: any) =>
            (a.isPrincipal ?? 0) > (b.isPrincipal ?? 0) ? 1 : (b.isPrincipal ?? 0) > (a.isPrincipal ?? 0) ? -1 : 0,
          );
          this.fillName(this.publicaciones[i]);
        }
      }
    });
  }

  getAutores(idAutor: number, i: number): void {
    this._autorService.getAuthor(idAutor).subscribe((res: any[]) => {
      if (this.publicaciones[i] != undefined) {
        if (this.publicaciones[i].autor?.findIndex((x: any) => x.idAutor === res[0].idAutor) == -1) {
          this.publicaciones[i].autor.push(res[0]);
        }
        this.fillAuthName(this.publicaciones[i]);
      }
    });
  }

  getPublicacionHasAutor(idPublicacion: number, i: number): void {
    this._publicacionhasautorService.getPublicacionHasAutor(idPublicacion).subscribe((res: any[]) => {
      for (let index = 0; index < res.length; index++) {
        this.getAutores(res[index].autores_idAutor, i);
      }
    });
  }

  getPublicacionHasUsuario(idPublicacion: number, i: number): void {
    this._publicacionhasusuarioService.getPublicacionHasUsuario(idPublicacion).subscribe((res: any[]) => {
      for (let index = 0; index < res.length; index++) {
        this.getUsuario(res[index].usuario_DNI, i, res[index].isPrincipal);
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
        for (let index = 0; index < res.length; index++) {
          if (
            this.publicacionSearch.findIndex((x: Publicacion) => x.idPublicacion === res[index].idPublicacion) == -1
          ) {
            this.publicacionSearch.push(res[index]);
          }
        }
      }
      for (let index = 0; index < this.publicacionSearch.length; index++) {
        if (this.publicacionSearch[index].tipoPublicacion_idTipoPublicacion != this.tipoPublicacion) {
          this.publicacionSearch.splice(index, 1);
        }
      }
      this.publicaciones = this.publicacionSearch;
      for (let index = 0; index < this.publicaciones.length; index++) {
        this.fillPublicacion(this.publicaciones[index], index);
      }
    });
  }

  getTipoTesis(publicacion: Publicacion): void {
    this._tipotesisService.getTiposTesis().subscribe((res: any[]) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          if (publicacion.tipoTesis_idTipoTesis == res[index].idTipoTesis) {
            publicacion.tipoTesis = res[index].nombre;
          }
        }
      }
    });
  }

  fillPublicacion(publicacion: Publicacion, index: number): void {
    publicacion.usuario = [];
    publicacion.autor = [];
    const d = new Date(publicacion.fechaPublicacion ?? "");
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    publicacion.fechaPublicacion = d.toISOString();
    publicacion.fecha = this.datePipe.transform(publicacion.fechaPublicacion, "MMMM y", "es") ?? undefined;
    publicacion.fecha = this.titlecasePipe.transform(publicacion.fecha ?? "");
    this.getUniversidad(publicacion);
    this.getRevista(publicacion);
    this.getPublicacionHasAutor(publicacion.idPublicacion ?? 0, index);
    this.getPublicacionHasUsuario(publicacion.idPublicacion ?? 0, index);
    this.getEvento(publicacion.evento_idEvento ?? 0, publicacion);
    this.getTipoTesis(publicacion);
  }

  fillName(obj: Publicacion): void {
    for (let index = 0; index < (obj.usuario?.length ?? 0); index++) {
      const first = (obj.usuario?.[index]?.nombre ?? "").split(" ");
      if (index == (obj.usuario?.length ?? 0) - 1 && (obj.autor?.length ?? 0) === 0) {
        obj.usuario![index].nombreCompleto = first[0] + " " + (obj.usuario?.[index]?.apellidoPaterno ?? "");
      } else {
        obj.usuario![index].nombreCompleto = first[0] + " " + (obj.usuario?.[index]?.apellidoPaterno ?? "") + ",";
      }
    }
  }

  fillAuthName(obj: Publicacion): void {
    for (let index = 0; index < (obj.autor?.length ?? 0); index++) {
      if (index == (obj.autor?.length ?? 0) - 1) {
        obj.autor![index].nombreAutor = obj.autor?.[index]?.nombre;
      } else {
        obj.autor![index].nombreAutor = (obj.autor?.[index]?.nombre ?? "") + ",";
      }
    }
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
      this.searchAutores(titulo);
      if (id === 3) {
        this.searchEventos(titulo, id);
      }
      if (id === 2) {
        this.searchTipoTesis(titulo, id);
      }
      this.allCharged = true;
    });
  }
  searchAutores(nombre: string): void {
    this._searchService.searchAutores(nombre).subscribe((res: any[]) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.searchPublicacionHasAutor(res[index].idAutor);
        }
      }
      this.searchUsuarios(nombre, res);
    });
  }
  searchUsuarios(nombre: string, autor: any[]): void {
    this._searchService.searchUsuarios(nombre).subscribe((res: any[]) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.searchPublicacionHasUsuario(res[index].DNI);
        }
      } else if (res.length == 0 && autor.length == 0) {
        this.publicaciones = this.publicacionSearch;
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index], index);
        }
      }
    });
  }

  searchPublicacionHasUsuario(DNI: string): void {
    this._publicacionhasusuarioService.searchPublicacionHasUsuario(DNI).subscribe((res: any[]) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getPublicacion(res[index].publicacion_idPublicacion);
        }
      }
    });
  }
  searchPublicacionHasAutor(id: number): void {
    this._publicacionhasautorService.searchPublicacionHasAutor(id).subscribe((res: any[]) => {
      for (let index = 0; index < res.length; index++) {
        this.getPublicacion(res[index].publicacion_idPublicacion);
      }
    });
  }
  searchEventos(nombre: string, tipoPublicacion: number): void {
    this._publicacionService.getPublicaciones(tipoPublicacion).subscribe((res: Publicacion[]) => {
      if (res.length > 0) {
        const publicacionesFound = res;
        this._searchService.searchEventos(nombre).subscribe((searchEvents: any[]) => {
          if (searchEvents.length > 0) {
            for (let index = 0; index < searchEvents.length; index++) {
              const valor = publicacionesFound.findIndex(
                (x: Publicacion) => x.evento_idEvento === searchEvents[index].idEvento,
              );
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
            const publicacionesFound = resPublicaciones;
            for (let index = 0; index < publicacionesFound.length; index++) {
              for (let j = 0; j < tipoTesis.length; j++) {
                if (tipoTesis[j].idTipoTesis === publicacionesFound[index].tipoTesis_idTipoTesis) {
                  this.getPublicacion(publicacionesFound[index].idPublicacion ?? 0);
                }
              }
            }
          }
        });
      }
    });
  }

  /* Fin de busqueda */

  profile(user: { DNI?: string }): void {
    if (!user.DNI) {
      return;
    }
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(["/home/detail-member/" + user.DNI]);
  }
}
