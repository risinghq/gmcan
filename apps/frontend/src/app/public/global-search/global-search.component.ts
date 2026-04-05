import { TitleCasePipe, DatePipe, SlicePipe } from "@angular/common";
import { Location } from "@angular/common";
import { Component, OnInit, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router, Params } from "@angular/router";
import { Noticia } from "@app/shared/models/noticia";
import { Proyecto } from "@app/shared/models/proyecto";
import { Publicacion } from "@app/shared/models/publicacion";
import type { SearchResults } from "@app/shared/models/search-results";
import { TipoNoticia } from "@app/shared/models/tiponoticia";
import { TipoPublicacion } from "@app/shared/models/tipopublicacion";
import { Usuario } from "@app/shared/models/usuario";
import { UsuarioFull } from "@app/shared/models/usuarioFull";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { SearchService } from "@app/shared/services/search.service";
import { SessionService } from "@app/shared/services/session.service";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

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
  private mapProject(hit: SearchResults["projects"][number]): Proyecto {
    const users: Usuario[] = (hit.usuario ?? []).map((user) => ({
      DNI: user.DNI,
      nombreCompleto: user.nombreCompleto,
      foto: user.foto ?? undefined,
    }));

    return {
      idProyecto: hit.idProyecto,
      titulo: hit.titulo,
      tituloEN: hit.tituloEN ?? undefined,
      codigo: hit.codigo,
      montoFinanciado: hit.montoFinanciado,
      descripcion: hit.descripcion,
      descripcionEN: hit.descripcionEN ?? undefined,
      estado: hit.estado ?? undefined,
      fechaInicio: new Date(hit.fechaInicio),
      fechaFin: hit.fechaFin ? new Date(hit.fechaFin) : undefined,
      lineasInvestigacion_idLineasInvestigacion: hit.lineasInvestigacion_idLineasInvestigacion,
      fuenteFinanciamiento_idFuenteFinanciamiento: hit.fuenteFinanciamiento_idFuenteFinanciamiento,
      moneda_idMoneda: hit.moneda_idMoneda,
      lineasInvestigacion: hit.lineasInvestigacion,
      fuenteFinanciamiento: hit.fuenteFinanciamiento,
      usuario: users,
    };
  }

  private mapMember(hit: SearchResults["members"][number]): UsuarioFull {
    return {
      DNI: hit.DNI,
      correo: hit.correo,
      nombre: hit.nombre,
      apellidoPaterno: hit.apellidoPaterno,
      apellidoMaterno: hit.apellidoMaterno ?? undefined,
      fechaNacimiento: hit.fechaNacimiento,
      resumenPro: hit.resumenPro ?? undefined,
      resumenProEN: hit.resumenProEN ?? undefined,
      foto: hit.foto ?? undefined,
      estado: hit.estado,
      tipoUsuario_idTipoUsuario: hit.tipoUsuario_idTipoUsuario,
      tipoMiembro_idTipoMiembro: hit.tipoMiembro_idTipoMiembro,
      prefijo_idPrefijo: hit.prefijo_idPrefijo ?? undefined,
    };
  }

  private mapNews(hit: SearchResults["news"][number]): Noticia {
    return {
      idNoticia: hit.idNoticia,
      titulo: hit.titulo ?? undefined,
      fechaPublicacion: hit.fechaPublicacion ?? undefined,
      foto: hit.foto ?? undefined,
      autorPublicacion: hit.autorPublicacion ?? undefined,
      tipoNoticia_idtipoNoticia: hit.tipoNoticia_idtipoNoticia ?? undefined,
      estado: hit.estado ?? undefined,
      autor: hit.autor,
    };
  }

  private mapPublication(hit: SearchResults["publications"][number]): Publicacion {
    return {
      idPublicacion: hit.idPublicacion,
      titulo: hit.titulo,
      archivo: hit.archivo ?? undefined,
      resumen: hit.resumen ?? undefined,
      resumenEN: hit.resumenEN ?? undefined,
      DOI: hit.DOI ?? undefined,
      fechaPublicacion: hit.fechaPublicacion,
      tipoPublicacion_idTipoPublicacion: hit.tipoPublicacion_idTipoPublicacion,
      nroRevista: hit.nroRevista ?? undefined,
      revista_idRevista: hit.revista_idRevista ?? undefined,
      universidad_idUniversidad: hit.universidad_idUniversidad ?? undefined,
      evento_idEvento: hit.evento_idEvento ?? undefined,
      tipoTesis_idTipoTesis: hit.tipoTesis_idTipoTesis ?? undefined,
      autor: hit.autor,
    };
  }

  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _searchService = inject(SearchService);
  lookup = inject(LookupService);
  fb = inject(FormBuilder);
  private _session = inject(SessionService);
  location = inject(Location);
  private titleService = inject(Title);
  private readonly destroyRef = inject(DestroyRef);

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

  constructor() {
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
    this.tipoPublicaciones = [...this.lookup.tiposPublicacion()];
    this._route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params: Params) => {
      const nombre = params["id"];
      this.titleService.setTitle("GMCAN | " + nombre);
      this.searchGlobalForm.controls["nombre"].setValue(nombre);
      this.searchAll(nombre);
    });
  }

  searchAll(nombre: string): void {
    this._searchService.search(nombre, ["projects", "members", "news", "publications"]).subscribe((results) => {
      this.proyectos = results.projects
        .toSorted((a, b) =>
          (a.fechaInicio ?? "") < (b.fechaInicio ?? "") ? 1 : (b.fechaInicio ?? "") < (a.fechaInicio ?? "") ? -1 : 0,
        )
        .map((project) => this.mapProject(project));
      for (const proyecto of this.proyectos) {
        this.fillProyecto(proyecto);
      }

      this.miembros = results.members.map((member) => {
        const mapped = this.mapMember(member);
        const prefijo = this.lookup.prefijos().find((p) => p.idPrefijo === member.prefijo_idPrefijo);
        const enriched = Object.assign({}, mapped);
        enriched.prefijo = prefijo?.nombre;
        return enriched;
      });

      this.noticias = [];
      for (const item of results.news) {
        if (item.estado !== 1) continue;
        const noticia = this.mapNews(item);
        if (this.noticias.findIndex((x) => x.idNoticia === noticia.idNoticia) === -1) {
          this.fillNoticia(noticia);
          this.noticias.push(noticia);
        }
      }

      this.publicaciones = [];
      for (const pub of results.publications) {
        const publication = this.mapPublication(pub);
        if (this.publicaciones.findIndex((x) => x.idPublicacion === publication.idPublicacion) === -1) {
          this.fillPublicacion(publication);
          this.publicaciones.push(publication);
        }
      }
    });
  }

  getEvento(idEvento: number, publicacion: Publicacion): void {
    const found = this.lookup.eventos().find((e) => e.idEvento === idEvento);
    if (found) {
      publicacion.evento = found.nombre;
      publicacion.ciudad = found.ciudad ?? "";
      publicacion.pais = found.pais ?? "";
    }
  }

  getTipoTesis(publicacion: Publicacion): void {
    const found = this.lookup.tiposTesis().find((t) => t.idTipoTesis === publicacion.tipoTesis_idTipoTesis);
    if (found) publicacion.tipoTesis = found.nombre;
  }

  /* Fill publication data */

  fillPublicacion(publicacion: Publicacion): void {
    publicacion.autor = publicacion.autor ?? [];
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
    this.getUniversidad(publicacion);
    this.getRevista(publicacion);
    this.getEvento(publicacion.evento_idEvento ?? 0, publicacion);
    this.getTipoTesis(publicacion);
  }

  /* Fill project data */

  fillProyecto(proyecto: Proyecto): void {
    proyecto.fechaI = this.datePipe.transform(proyecto.fechaInicio ?? "", "MMMM, y", "es") ?? undefined;
    proyecto.fechaI = this.titlecasePipe.transform(proyecto.fechaI ?? "");
    proyecto.usuario = proyecto.usuario ?? [];
    if (proyecto.fechaFin) {
      proyecto.fechaF = this.datePipe.transform(proyecto.fechaFin, "MMMM, y", "es") ?? undefined;
      proyecto.fechaF = this.titlecasePipe.transform(proyecto.fechaF ?? "");
    }
  }

  /* get Noticias */

  getTipoNoticias(): void {
    this.tiponoticias = [...this.lookup.tiposNoticia()];
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
  }

  getRevista(publicacion: Publicacion): void {
    const found = this.lookup.revistas().find((r) => r.idRevista === publicacion.revista_idRevista);
    if (found) publicacion.revista = found.nombre;
  }

  getUniversidad(publicacion: Publicacion): void {
    const found = this.lookup.universidades().find((u) => u.idUniversidad === publicacion.universidad_idUniversidad);
    if (found) publicacion.universidad = found.nombre ?? "";
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
