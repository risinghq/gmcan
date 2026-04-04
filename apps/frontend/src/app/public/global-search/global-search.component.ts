import { TitleCasePipe, DatePipe, NgClass, SlicePipe } from "@angular/common";
import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router, Params } from "@angular/router";
import { Noticia } from "@app/shared/models/noticia";
import { Proyecto } from "@app/shared/models/proyecto";
import { Publicacion } from "@app/shared/models/publicacion";
import { TipoNoticia } from "@app/shared/models/tiponoticia";
import { TipoPublicacion } from "@app/shared/models/tipopublicacion";
import { UsuarioFull } from "@app/shared/models/usuarioFull";
import { EventoService } from "@app/shared/services/evento.service";
import { GLOBAL } from "@app/shared/services/global";
import { LineasInvestigacionService } from "@app/shared/services/lineasinvestigacion.service";
import { NoticiaService } from "@app/shared/services/noticia.service";
import { ProyectoService } from "@app/shared/services/proyecto.service";
import { PublicacionAutoresService } from "@app/shared/services/publicacion-autores.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { RevistaService } from "@app/shared/services/revista.service";
import { SearchService } from "@app/shared/services/search.service";
import { SessionService } from "@app/shared/services/session.service";
import { TipoNoticiaService } from "@app/shared/services/tiponoticia.service";
import { TipoPublicacionService } from "@app/shared/services/tipopublicacion.service";
import { TipoTesisService } from "@app/shared/services/tipotesis.service";
import { UniversidadService } from "@app/shared/services/universidad.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { UsuarioHasProyectoService } from "@app/shared/services/usuariohasproyecto";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

@Component({
  selector: "app-global-search",
  templateUrl: "./global-search.component.html",
  styleUrls: ["./global-search.component.scss"],
  imports: [
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    SlicePipe,
  ],
})
export default class GlobalSearchComponent implements OnInit {
  proyectos: Proyecto[] = [];
  publicaciones: Publicacion[] = [];
  miembros: UsuarioFull[] = [];
  noticias: Noticia[] = [];
  tipoPublicaciones: TipoPublicacion[] = [];
  tiponoticias: TipoNoticia[] = [];
  language: any = {};
  public searchGlobalForm: FormGroup;
  page1 = 1;
  pageSize = 5;
  page2 = 1;
  public url: string;

  constructor(
    public titlecasePipe: TitleCasePipe,
    public datePipe: DatePipe,
    public _route: ActivatedRoute,
    public _router: Router,
    public _searchService: SearchService,
    public _publicacionAutoresService: PublicacionAutoresService,
    public _proyectohasusuarioService: UsuarioHasProyectoService,
    public _usuarioService: UsuarioService,
    public _revistaService: RevistaService,
    public _universidadService: UniversidadService,
    public _lineasInvestigacionServices: LineasInvestigacionService,
    public _proyectoServices: ProyectoService,
    public _tiponoticiaService: TipoNoticiaService,
    public _noticiaService: NoticiaService,
    public _eventoService: EventoService,
    public _tipotesisService: TipoTesisService,
    public _publicacionesService: PublicacionService,
    public _tipoPublicacionService: TipoPublicacionService,
    public fb: FormBuilder,
    private _session: SessionService,
    public location: Location,
    private titleService: Title,
  ) {
    this.searchGlobalForm = this.fb.group({
      nombre: [""],
    });
    this.url = GLOBAL.url;
  }

  public previouslink: string | null = null;

  ngOnInit(): void {
    this.language = this._session.getLanguageData<any>() ?? {};
    this.findGlobal();
    this.previouslink = sessionStorage.getItem("previous-page");
  }

  /* globalSearch */

  searchGlobal(value: string): void {
    this._router.navigate(["/home/search/" + value]);
    this.ngOnInit();
  }
  findGlobal(): void {
    this.publicaciones = [];
    this.proyectos = [];
    this.noticias = [];
    this.miembros = [];
    this.tipoPublicaciones = [];
    this.getTipoPublicacion();
    this.getTipoNoticias();
  }

  getTipoPublicacion(): void {
    this._tipoPublicacionService.getTipoPublicaciones().subscribe((res: TipoPublicacion[]) => {
      if (res) {
        this.tipoPublicaciones = res;
      }
      this._route.params.forEach((params: Params) => {
        let nombre = params["id"];
        this.titleService.setTitle("GMCAN | " + nombre);
        this.searchGlobalForm.controls["nombre"].setValue(nombre);
        this.searchProyectos(nombre);
      });
    });
  }

  searchProyectos(nombre: string): void {
    this._searchService.searchProyectosGlobal(nombre).subscribe((res: Proyecto[]) => {
      if (res) {
        res.sort((a: Proyecto, b: Proyecto) =>
          (a.fechaInicio ?? "") < (b.fechaInicio ?? "") ? 1 : (b.fechaInicio ?? "") < (a.fechaInicio ?? "") ? -1 : 0,
        );
        this.proyectos = res;
        for (let index = 0; index < this.proyectos.length; index++) {
          this.fillProyecto(this.proyectos[index], index);
        }
      }
      this.searchLineasInvestigacion(nombre);
      this.searchUsuarios(nombre);
    });
  }

  searchLineasInvestigacion(nombre: string): void {
    this._searchService.searchLineasInvestigacion(nombre).subscribe((res: any[]) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getProyectoLinea(res[index].idLineasInvestigacion);
        }
      }
    });
  }

  searchUsuarios(nombre: string): void {
    this._searchService.searchUsuariosGlobal(nombre).subscribe((res: UsuarioFull[]) => {
      if (res.length > 0) {
        this.miembros = res;
        for (let index = 0; index < this.miembros.length; index++) {
          this.getUsuariosHasProyecto(this.miembros[index]);
          this.getUsuarioHasPublicacion(this.miembros[index]);
          this.getUsuarioHasNoticia(this.miembros[index]);
        }
      }
      this.searchNoticias(nombre);
    });
  }

  searchNoticias(nombre: string): void {
    this._searchService.searchNoticiasGlobal(nombre).subscribe((res: Noticia[]) => {
      if (res.length > 0) {
        this.noticias = res;
        this.noticias.sort((a: Noticia, b: Noticia) =>
          (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
            ? 1
            : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
              ? -1
              : 0,
        );
        for (let index = 0; index < this.noticias.length; index++) {
          if (this.noticias[index].estado == 1) {
            this.fillNoticia(this.noticias[index]);
          } else {
            this.noticias.splice(index, 1);
            index--;
          }
        }
      }
      this.searchTipoNoticia(nombre);
    });
  }

  searchTipoNoticia(nombre: string): void {
    this._searchService.searchTipoNoticiasGlobal(nombre).subscribe((res: TipoNoticia[]) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getNoticiasTipo(res[index].idtipoNoticia ?? 0);
        }
      }
      this.searchPublicaciones(nombre);
    });
  }

  searchPublicaciones(nombre: string): void {
    this._searchService.searchPublicacionesGlobal(nombre).subscribe((res: Publicacion[]) => {
      if (res.length > 0) {
        this.publicaciones = res;
        for (const pub of this.publicaciones) {
          this.fillPublicacion(pub);
        }
      }
      this.searchByAuthors(nombre);
    });
  }

  searchByAuthors(nombre: string): void {
    this._publicacionAutoresService.searchPublications(nombre).subscribe((res) => {
      for (const item of res) {
        this.getPublicacion(item.publicacion_idPublicacion);
      }
      this.searchEventos(nombre);
    });
  }

  searchEventos(nombre: string): void {
    this._searchService.searchEventos(nombre).subscribe((res: any[]) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getPublicacionEvento(res[index].idEvento);
        }
      }
      this.searchRevista(nombre);
    });
  }

  searchRevista(nombre: string): void {
    this._searchService.searchRevista(nombre).subscribe((res: any[]) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getPublicacionRevista(res[index].idRevista);
        }
      }
    });
  }

  /* Get publication data */

  getUsuarioHasPublicacion(obj: UsuarioFull): void {
    this._publicacionAutoresService.getByUser(obj.DNI ?? "").subscribe((res) => {
      for (const item of res) {
        this.getPublicacion(item.publicacion_idPublicacion);
      }
    });
  }

  getPublicacionCiudad(idCiudad: number): void {
    this._publicacionesService.getPublicacionesCiudad(idCiudad).subscribe((res: Publicacion[]) => {
      if (res.length > 0) {
        if (this.publicaciones) {
          for (let index = 0; index < res.length; index++) {
            if (this.publicaciones.findIndex((x: Publicacion) => x.idPublicacion === res[index].idPublicacion) == -1) {
              this.publicaciones.push(res[index]);
            }
          }
        } else {
          this.publicaciones = res;
        }
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index]);
        }
      }
    });
  }

  getPublicacionEvento(idEvento: number): void {
    this._publicacionesService.getPublicacionesEvento(idEvento).subscribe((res: Publicacion[]) => {
      if (res.length > 0) {
        if (this.publicaciones) {
          for (let index = 0; index < res.length; index++) {
            if (this.publicaciones.findIndex((x: Publicacion) => x.idPublicacion === res[index].idPublicacion) == -1) {
              this.publicaciones.push(res[index]);
            }
          }
        } else {
          this.publicaciones = res;
        }
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index]);
        }
      }
    });
  }

  getPublicacionRevista(idRevista: number): void {
    this._publicacionesService.getPublicacionesRevista(idRevista).subscribe((res: Publicacion[]) => {
      if (res.length > 0) {
        if (this.publicaciones) {
          for (let index = 0; index < res.length; index++) {
            if (this.publicaciones.findIndex((x: Publicacion) => x.idPublicacion === res[index].idPublicacion) == -1) {
              this.publicaciones.push(res[index]);
            }
          }
        } else {
          this.publicaciones = res;
        }
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index]);
        }
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

  getPublicacion(idPublicacion: number): void {
    this._publicacionesService.getPublication(idPublicacion).subscribe((res: Publicacion[]) => {
      if (res.length > 0) {
        if (this.publicaciones) {
          if (this.publicaciones.findIndex((x) => x.idPublicacion === res[0].idPublicacion) == -1) {
            this.publicaciones.push(res[0]);
          }
        } else {
          this.publicaciones = res;
        }
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index]);
        }
      }
    });
  }

  /* Fill publication data */

  fillPublicacion(publicacion: Publicacion): void {
    publicacion.autor = [];
    const d = new Date(publicacion.fechaPublicacion ?? "");
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    publicacion.fecha = this.datePipe.transform(d, "MMMM y", "es") ?? undefined;
    publicacion.fecha = this.titlecasePipe.transform(publicacion.fecha ?? "");
    const tipoIdx = this.tipoPublicaciones.findIndex(
      (x) => x.idTipoPublicacion === publicacion.tipoPublicacion_idTipoPublicacion,
    );
    if (tipoIdx !== -1) {
      publicacion.tipoPublicacion = this.tipoPublicaciones[tipoIdx].nombre;
    }
    this._publicacionAutoresService.getForPublication(publicacion.idPublicacion ?? 0).subscribe((authors) => {
      publicacion.autor = authors;
    });
    this.getUniversidad(publicacion);
    this.getRevista(publicacion);
    this.getEvento(publicacion.evento_idEvento ?? 0, publicacion);
    this.getTipoTesis(publicacion);
  }

  /* get Proyectos */
  getUsuariosHasProyecto(user: UsuarioFull): void {
    this._proyectohasusuarioService.getUsuarioHasProyecto(user.DNI ?? "").subscribe((res: any[]) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getProyectos(res[index].proyecto_idProyecto);
        }
      }
    });
  }

  getProyectosHasUsuario(proyecto: Proyecto): void {
    this._proyectohasusuarioService.getUsuarioHasProyectos(proyecto.idProyecto ?? 0).subscribe((res: any[]) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getUsuario(res[index].usuario_DNI, proyecto, 0);
        }
      }
    });
  }

  getLineasInvestigacion(idLinea: number, index: number): void {
    this._lineasInvestigacionServices.getLineaInvestigacion(idLinea).subscribe((res: any[]) => {
      if (res.length > 0) {
        if (this.proyectos[index] != undefined) {
          this.proyectos[index].lineasInvestigacion = res[0].nombre;
        }
      }
    });
  }

  getProyectos(idProyecto: number): void {
    this._proyectoServices.getProyectosId(idProyecto, 1).subscribe((res: Proyecto[]) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          if (this.proyectos.findIndex((x: Proyecto) => x.idProyecto === res[index].idProyecto) == -1) {
            this.proyectos.push(res[index]);
          }
        }
        for (let index = 0; index < this.proyectos.length; index++) {
          this.fillProyecto(this.proyectos[index], index);
        }
      }
    });
  }

  getProyectoLinea(idLineasInvestigacion: number): void {
    this._proyectoServices.getProyectosLinea(idLineasInvestigacion, 1).subscribe((res: Proyecto[]) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          if (this.proyectos.findIndex((x: Proyecto) => x.idProyecto === res[index].idProyecto) == -1) {
            this.proyectos.push(res[index]);
          }
        }
        for (let index = 0; index < this.proyectos.length; index++) {
          this.fillProyecto(this.proyectos[index], index);
        }
      }
    });
  }

  /* Fill project data */

  fillProyecto(proyecto: Proyecto, index: number): void {
    proyecto.fechaI = this.datePipe.transform(proyecto.fechaInicio ?? "", "MMMM, y", "es") ?? undefined;
    proyecto.fechaI = this.titlecasePipe.transform(proyecto.fechaI ?? "");
    proyecto.usuario = [];
    if (proyecto.fechaFin) {
      proyecto.fechaF = this.datePipe.transform(proyecto.fechaFin, "MMMM, y", "es") ?? undefined;
      proyecto.fechaF = this.titlecasePipe.transform(proyecto.fechaF ?? "");
    }
    this.getLineasInvestigacion(proyecto.lineasInvestigacion_idLineasInvestigacion ?? 0, index);
    this.getProyectosHasUsuario(proyecto);
  }

  /* get Noticias */

  getTipoNoticias(): void {
    this._tiponoticiaService.getTipoNoticia().subscribe((res: TipoNoticia[]) => {
      this.tiponoticias = res;
    });
  }

  getNoticiasTipo(id: number): void {
    this._noticiaService.getNoticiaTipo(id).subscribe((res: Noticia[]) => {
      if (res.length > 0) {
        if (this.noticias) {
          for (let index = 0; index < res.length; index++) {
            if (this.noticias.findIndex((x: Noticia) => x.idNoticia === res[index].idNoticia) == -1) {
              this.noticias.push(res[index]);
            }
          }
        } else {
          this.noticias = res;
          this.noticias.sort((a: Noticia, b: Noticia) =>
            (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
              ? 1
              : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
                ? -1
                : 0,
          );
        }
        for (let index = 0; index < this.noticias.length; index++) {
          if (this.noticias[index].estado == 1) {
            this.fillNoticia(this.noticias[index]);
          } else {
            this.noticias.splice(index, 1);
            index--;
          }
        }
      }
    });
  }

  getUsuarioHasNoticia(usuario: UsuarioFull): void {
    this._noticiaService.getNoticiaUsuario(usuario.DNI ?? "").subscribe((res: Noticia[]) => {
      if (res.length > 0) {
        if (this.noticias) {
          for (let index = 0; index < res.length; index++) {
            if (this.noticias.findIndex((x: Noticia) => x.idNoticia === res[index].idNoticia) == -1) {
              this.noticias.push(res[index]);
            }
          }
        } else {
          this.noticias = res;
          this.noticias.sort((a: Noticia, b: Noticia) =>
            (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
              ? 1
              : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
                ? -1
                : 0,
          );
        }
        for (let index = 0; index < this.noticias.length; index++) {
          if (this.noticias[index].estado == 1) {
            this.fillNoticia(this.noticias[index]);
          } else {
            this.noticias.splice(index, 1);
            index--;
          }
        }
      }
    });
  }

  /* Fill Noticia */

  fillNoticia(obj: Noticia): void {
    for (let j = 0; j < this.tiponoticias.length; j++) {
      if (obj.tipoNoticia_idtipoNoticia === this.tiponoticias[j].idtipoNoticia) {
        obj.nombreTipoNoticia = this.tiponoticias[j].nombre;
      }
    }
    const d = new Date(obj.fechaPublicacion ?? "");
    if (String(d) != "Invalid Date") {
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      obj.fechaPublicacion = this.datePipe.transform(d, "MMMM dd, y", "es") ?? undefined;
      obj.fechaPublicacion = this.titlecasePipe.transform(obj.fechaPublicacion ?? "");
    }
    this.getUsuarioNoticia(obj);
  }

  /*  Get Normal */

  getUsuario(idUser: string, obj: any, isPrincipal: number): void {
    this._usuarioService.getUser(idUser).subscribe((res: any[]) => {
      if (res[0] != undefined) {
        res[0].nombre = res[0].nombre.slice(0, 1) + ".";
        res[0].isPrincipal = isPrincipal;
        if (obj != undefined) {
          if (obj.usuario.findIndex((x: any) => x.DNI === res[0].DNI) == -1) {
            obj.usuario.push(res[0]);
          }
          obj.usuario.sort((a: any, b: any) =>
            (a.isPrincipal ?? 0) > (b.isPrincipal ?? 0) ? 1 : (b.isPrincipal ?? 0) > (a.isPrincipal ?? 0) ? -1 : 0,
          );
          this.fillName(obj);
        }
      }
    });
  }

  getUsuarioNoticia(obj: Noticia): void {
    this._usuarioService.getUser(obj.autorPublicacion ?? "").subscribe((res: any[]) => {
      if (res[0] != undefined) {
        obj.autor = res[0].nombre + " " + res[0].apellidoPaterno;
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

  getUniversidad(publicacion: Publicacion): void {
    this._universidadService.getUniversidad(publicacion.universidad_idUniversidad ?? 0).subscribe((res: any) => {
      if (res && res[0] != undefined) {
        publicacion.universidad = res[0].nombre;
      }
    });
  }

  /* Fill Name */

  fillName(obj: any): void {
    for (let index = 0; index < obj.usuario.length; index++) {
      const first = (obj.usuario[index].nombre ?? "").split(" ");
      if (obj.autor != undefined) {
        if (index == obj.usuario.length - 1 && obj.autor.length === 0) {
          obj.usuario[index].nombreCompleto = first[0] + " " + obj.usuario[index].apellidoPaterno;
        } else {
          obj.usuario[index].nombreCompleto = first[0] + " " + obj.usuario[index].apellidoPaterno + ",";
        }
      } else {
        if (index == obj.usuario.length - 1) {
          obj.usuario[index].nombreCompleto = first[0] + " " + obj.usuario[index].apellidoPaterno;
        } else {
          obj.usuario[index].nombreCompleto = first[0] + " " + obj.usuario[index].apellidoPaterno + ",";
        }
      }
    }
  }

  fillAuthName(obj: any): void {
    for (let index = 0; index < obj.autor.length; index++) {
      if (index == obj.autor.length - 1) {
        obj.autor[index].nombreAutor = obj.autor[index].nombre;
      } else {
        obj.autor[index].nombreAutor = obj.autor[index].nombre + ",";
      }
    }
  }

  /* Hovers Publicaciones */

  /* Share Hover */
  public fbicon = "../../assets/img/Facebook.svg";
  public twitter = "../../assets/img/twitter.svg";
  mouseEnter(int: number, index: number): void {
    switch (int) {
      case 1:
        document.getElementById("fb" + index)?.setAttribute("src", "../../assets/img/Facebook2.svg");
        break;
      case 2:
        document.getElementById("t" + index)?.setAttribute("src", "../../assets/img/twitter2.svg");
        break;
      case 3:
        document.getElementById("fbl" + index)?.setAttribute("src", "../../assets/img/Facebook2.svg");
        break;
      case 4:
        document.getElementById("tl" + index)?.setAttribute("src", "../../assets/img/twitter2.svg");
        break;
    }
  }

  mouseLeave(int: number, index: number): void {
    switch (int) {
      case 1:
        document.getElementById("fb" + index)?.setAttribute("src", "../../assets/img/Facebook.svg");
        break;
      case 2:
        document.getElementById("t" + index)?.setAttribute("src", "../../assets/img/twitter.svg");
        break;
      case 3:
        document.getElementById("fbl" + index)?.setAttribute("src", "../../assets/img/Facebook.svg");
        break;
      case 4:
        document.getElementById("tl" + index)?.setAttribute("src", "../../assets/img/twitter.svg");
        break;
    }
  }

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

  scroll(): void {
    const el = document.getElementById("main-toolbar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  profile(user: { DNI?: string }): void {
    if (!user.DNI) {
      return;
    }
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(["/home/detail-member/" + user.DNI]);
  }

  detalleNoticia(noticia: { idNoticia?: number }): void {
    if (!noticia.idNoticia) {
      return;
    }
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(["/home/detail-news/" + noticia.idNoticia]);
  }

  return() {
    if (this.previouslink) {
      this._router.navigate([this.previouslink]);
    } else {
      this._router.navigate(["/home"]);
    }
  }
  publicationExpanded = true;
  projectExpanded = true;
  memberExpanded = true;
  newsExpanded = true;

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
