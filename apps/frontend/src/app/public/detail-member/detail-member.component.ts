import { DatePipe, SlicePipe } from "@angular/common";
import { TitleCasePipe } from "@angular/common";
import { Location } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute, Params } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import type { PublicationAuthor } from "@app/shared/models/author";
import { createUsuarioFull } from "@app/shared/models/factories";
import type { Publicacion } from "@app/shared/models/publicacion";
import type { TipoPublicacion } from "@app/shared/models/tipopublicacion";
import type { UsuarioFull } from "@app/shared/models/usuarioFull";
import { EventoService } from "@app/shared/services/evento.service";
import { GLOBAL } from "@app/shared/services/global";
import { PrefijoService } from "@app/shared/services/prefijo.service";
import { PreviousPageService } from "@app/shared/services/previouspage.service";
import { PublicacionAutoresService } from "@app/shared/services/publicacion-autores.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { RevistaService } from "@app/shared/services/revista.service";
import { SessionService } from "@app/shared/services/session.service";
import { TipoMiembroService } from "@app/shared/services/tipomiembro.service";
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
  selector: "app-detail-member",
  templateUrl: "./detail-member.component.html",
  styleUrl: "./detail-member.component.scss",
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
  _publicacionService = inject(PublicacionService);
  _revistaService = inject(RevistaService);
  _universidadService = inject(UniversidadService);
  _previousService = inject(PreviousPageService);
  _prefijoService = inject(PrefijoService);
  _tipoMiembroService = inject(TipoMiembroService);
  _tipoPublicacionService = inject(TipoPublicacionService);
  _tipotesisService = inject(TipoTesisService);
  _eventoService = inject(EventoService);
  private _session = inject(SessionService);
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
    this.language = this._session.getLanguageData<any>() ?? {};
    this.getTipoPublicacion();
    this.previouslink = sessionStorage.getItem("previous-page");
    this.previouspage = this._previousService.getPreviousPage(this.previouslink ?? "");
  }
  selectedItem = -1;
  oldValue = -1;
  listClick(_event: Event, newValue: number) {
    this.oldValue = this.selectedItem;
    this.selectedItem = newValue;
    const current = document.getElementById("abstract" + newValue);
    if (current) {
      current.innerText = this.language.detailMemberText[0].seeLess;
    }
    if (this.selectedItem == this.oldValue) {
      this.selectedItem = -1;
      const previous = document.getElementById("abstract" + this.oldValue);
      if (previous) {
        previous.innerText = this.language.detailMemberText[0].seeMore;
      }
    }
  }

  scroll(): void {
    const el = document.getElementById("main-toolbar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  /* Share Hover */
  public fbicon = "../../assets/img/Facebook.svg";
  public twitter = "../../assets/img/twitter.svg";
  mouseEnter(int: number, index: number) {
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

  mouseLeave(int: number, index: number) {
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

  searchUsuario(): void {
    this.publicaciones = [];
    this._route.params.forEach((params: Params) => {
      const DNI = params["id"];
      this._usuarioService.getUser(DNI).subscribe((res: any) => {
        if (res) {
          this.usuario = res[0];
          if (this.usuario.estado === 1) {
            this.usuario.active = this.language.detailMemberText[0].activeMember;
          } else {
            this.usuario.active = this.language.detailMemberText[0].oldMember;
          }
          this.titleService.setTitle("GMCAN | " + this.usuario.nombre + " " + this.usuario.apellidoPaterno);
          this.loadPublications(this.usuario.DNI ?? "");
          this.getPrefijos();
          this.getTipoMiembros();
        }
      });
    });
  }

  loadPublications(DNI: string): void {
    this._publicacionAutoresService.getByUser(DNI).subscribe((res) => {
      if (res.length > 0) {
        for (const item of res) {
          this.getPublicacion(item.publicacion_idPublicacion);
        }
      }
    });
  }

  getTipoPublicacion() {
    this._tipoPublicacionService.getTipoPublicaciones().subscribe((res: any) => {
      this.tipoPublicaciones = [];
      if (res) {
        this.tipoPublicaciones = res;
        this.searchUsuario();
      }
      this.cargado = true;
    });
  }

  getPublicacion(idPublicacion: number) {
    this._publicacionService.getPublication(idPublicacion).subscribe((res: any) => {
      if (res.length > 0) {
        for (const pub of res) {
          if (this.publicaciones.findIndex((x) => x.idPublicacion === pub.idPublicacion) === -1) {
            this.publicaciones.push(pub);
          }
        }
        for (const publicacion of this.publicaciones) {
          this.fillPublicacion(publicacion);
        }
        this.cargado = true;
      }
    });
  }

  getTipoTesis(publicacion: any) {
    this._tipotesisService.getTiposTesis().subscribe((res: any) => {
      if (res.length > 0) {
        for (const tipo of res) {
          if (publicacion.tipoTesis_idTipoTesis == tipo.idTipoTesis) {
            publicacion.tipoTesis = tipo.nombre;
          }
        }
      }
    });
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
    this.getEvento(publicacion.evento_idEvento ?? 0, publicacion);
    this.getTipoTesis(publicacion);
  }

  getEvento(idEvento: number, publicacion: any) {
    this._eventoService.getEvento(idEvento).subscribe((res: any) => {
      if (res.length > 0) {
        publicacion.evento = res[0].nombre;
        publicacion.ciudad = res[0].ciudad;
        publicacion.pais = res[0].pais;
      }
    });
  }

  getRevista(publicacion: any) {
    this._revistaService.getRevista(publicacion.revista_idRevista ?? 0).subscribe((res: any) => {
      if (res && res[0] != undefined) {
        publicacion.revista = res[0].nombre;
      }
    });
  }

  getUniversidad(publicacion: any) {
    this._universidadService.getUniversidad(publicacion.universidad_idUniversidad ?? 0).subscribe((res: any) => {
      if (res && res[0] != undefined) {
        publicacion.universidad = res[0].nombre;
      }
    });
  }

  return(): void {
    this._router.navigate([this.previouslink ?? "/home"]);
  }

  getPrefijos() {
    this._prefijoService.getPrefijos().subscribe((res: any) => {
      if (res) {
        for (const prefijo of res) {
          if (
            this.usuario.prefijo_idPrefijo == prefijo.idPrefijo &&
            prefijo.nombre != "Ninguno" &&
            prefijo.nombre != "Bachiller"
          ) {
            this.usuario.prefijo = prefijo.nombre;
          }
        }
      }
    });
  }

  getTipoMiembros() {
    this._tipoMiembroService.getTipoMiembros().subscribe((res: any) => {
      if (res) {
        for (const tipo of res) {
          if (this.usuario.tipoMiembro_idTipoMiembro === tipo.idTipoMiembro) {
            this.usuario.tipoMiembro = tipo.nombreSingular;
          }
        }
      }
    });
  }

  profile(autor: PublicationAuthor): void {
    if (!autor?.DNI) {
      return;
    }
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(["/home/detail-member/" + autor.DNI]);
    this.getTipoPublicacion();
  }
}
