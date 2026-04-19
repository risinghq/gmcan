import { DatePipe, SlicePipe } from "@angular/common";
import { TitleCasePipe } from "@angular/common";
import { Location } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import type { PublicationAuthor } from "@app/shared/models/author";
import { createUsuarioFull } from "@app/shared/models/factories";
import type { MemberProfile } from "@app/shared/models/member-profile";
import type { Publicacion } from "@app/shared/models/publicacion";
import type { TipoPublicacion } from "@app/shared/models/tipopublicacion";
import type { UsuarioFull } from "@app/shared/models/usuarioFull";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { NavigationHistoryService } from "@app/shared/services/navigation-history.service";
import { PreviousPageService } from "@app/shared/services/previouspage.service";
import { PublicacionAutoresService } from "@app/shared/services/publicacion-autores.service";
import { SessionService } from "@app/shared/services/session.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

@Component({
  selector: "app-detail-member",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [
    MatProgressSpinner,
    MatIcon,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NewsComponent,
    SlicePipe,
  ],
})
export default class DetailMemberComponent implements OnInit {
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  _usuarioService = inject(UsuarioService);
  _publicacionAutoresService = inject(PublicacionAutoresService);
  lookup = inject(LookupService);
  private _navigationHistory = inject(NavigationHistoryService);
  _previousService = inject(PreviousPageService);
  private _session = inject(SessionService);
  private _browser = inject(BrowserService);
  location = inject(Location);
  private titleService = inject(Title);

  public usuario: UsuarioFull;
  public publicaciones: Array<Publicacion> = [];
  public tipoPublicaciones: Array<TipoPublicacion> = [];
  public cargado = false;
  public previouspage = "";
  public previouslink: string | null = null;
  public url: string;
  page = 1;
  pageSize = 5;
  constructor() {
    this.url = GLOBAL.url;
    this.usuario = createUsuarioFull();
  }

  language: any = {};

  ngOnInit(): void {
    this.language = this._session.language();
    this.getTipoPublicacion();
    this.previouslink = this._navigationHistory.previousUrl();
    this.previouspage = this._previousService.getPreviousPage(this.previouslink ?? "");
  }
  expandedKey: string | null = null;
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

  searchUsuario(): void {
    this.publicaciones = [];
    const DNI = this._route.snapshot.params["id"];
    this._usuarioService.getProfile(DNI).subscribe((res: MemberProfile) => {
      if (res?.usuario) {
        this.usuario = res.usuario;
        if (this.usuario.estado === 1) {
          this.usuario.active = this.language.detailMemberText[0].activeMember;
        } else {
          this.usuario.active = this.language.detailMemberText[0].oldMember;
        }
        this.titleService.setTitle("GMCAN | " + this.usuario.nombre + " " + this.usuario.apellidoPaterno);
        this.publicaciones = [...(res.publicaciones ?? [])];
        for (const publicacion of this.publicaciones) {
          this.fillPublicacion(publicacion);
        }
        this.cargado = true;
        this.getPrefijos();
        this.getTipoMiembros();
      }
    });
  }

  getTipoPublicacion() {
    this.tipoPublicaciones = this.lookup.tiposPublicacion().map((t) => Object.assign({}, t) as TipoPublicacion);
    this.searchUsuario();
  }

  getTipoTesis(publicacion: Publicacion) {
    const found = this.lookup.tiposTesis().find((t) => t.idTipoTesis === publicacion.tipoTesis_idTipoTesis);
    if (found) publicacion.tipoTesis = found.nombre;
  }

  fillPublicacion(publicacion: Publicacion) {
    publicacion.autor = [];
    const d = new Date(publicacion.fechaPublicacion ?? "");
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    publicacion.fechaPublicacion = d.toISOString();
    publicacion.fecha = this.datePipe.transform(publicacion.fechaPublicacion, "MMMM y") ?? "";
    publicacion.fecha = this.titlecasePipe.transform(publicacion.fecha ?? "");
    for (const tipo of this.tipoPublicaciones) {
      if (publicacion.tipoPublicacion_idTipoPublicacion === tipo.idTipoPublicacion) {
        publicacion.tipoPublicacion = tipo.nombre;
      }
    }
    this.getUniversidad(publicacion);
    this.getRevista(publicacion);
    this._publicacionAutoresService.getForPublication(publicacion.idPublicacion ?? 0).subscribe((authors) => {
      publicacion.autor = authors;
    });
    this.getEvento(publicacion);
    this.getTipoTesis(publicacion);
  }

  getEvento(publicacion: Publicacion) {
    const found = this.lookup.eventos().find((e) => e.idEvento === publicacion.evento_idEvento);
    if (found) {
      publicacion.evento = found.nombre;
      publicacion.ciudad = found.ciudad ?? "";
      publicacion.pais = found.pais ?? "";
    }
  }

  getRevista(publicacion: Publicacion) {
    const found = this.lookup.revistas().find((r) => r.idRevista === publicacion.revista_idRevista);
    if (found) publicacion.revista = found.nombre;
  }

  getUniversidad(publicacion: Publicacion) {
    const found = this.lookup.universidades().find((u) => u.idUniversidad === publicacion.universidad_idUniversidad);
    if (found) publicacion.universidad = found.nombre ?? "";
  }

  return(): void {
    this._router.navigate([this.previouslink ?? "/home"]);
  }

  getPrefijos() {
    const prefijos = this.lookup.prefijos();
    for (const prefijo of prefijos) {
      if (
        this.usuario.prefijo_idPrefijo == prefijo.idPrefijo &&
        prefijo.nombre != "Ninguno" &&
        prefijo.nombre != "Bachiller"
      ) {
        this.usuario.prefijo = prefijo.nombre;
      }
    }
  }

  getTipoMiembros() {
    const tipos = this.lookup.tiposMiembro();
    for (const tipo of tipos) {
      if (this.usuario.tipoMiembro_idTipoMiembro === tipo.idTipoMiembro) {
        this.usuario.tipoMiembro = tipo.nombreSingular;
      }
    }
  }

  profile(autor: PublicationAuthor): void {
    if (!autor?.DNI) {
      return;
    }
    this._router.navigate(["/home/detail-member/" + autor.DNI]);
    this.getTipoPublicacion();
  }
}
