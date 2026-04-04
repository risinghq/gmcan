import { DatePipe, NgIf, NgFor, NgClass, SlicePipe } from "@angular/common";
import { TitleCasePipe } from "@angular/common";
import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute, Params } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { createUsuarioFull } from "@app/shared/models/factories";
import type { Publicacion } from "@app/shared/models/publicacion";
import type { TipoPublicacion } from "@app/shared/models/tipopublicacion";
import type { UsuarioFull } from "@app/shared/models/usuarioFull";
import { AutorService } from "@app/shared/services/autor.service";
import { EventoService } from "@app/shared/services/evento.service";
import { GLOBAL } from "@app/shared/services/global";
import { PrefijoService } from "@app/shared/services/prefijo.service";
import { PreviousPageService } from "@app/shared/services/previouspage.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { PublicacionHasAutorService } from "@app/shared/services/publicacionhasautor.service";
import { PublicacionHasUsuarioService } from "@app/shared/services/publicacionhasusuario.service";
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
  styleUrls: ["./detail-member.component.scss"],
  imports: [
    NgIf,
    MatProgressSpinner,
    MatIcon,
    NgFor,
    NgClass,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NewsComponent,
    SlicePipe,
  ],
})
export default class DetailMemberComponent implements OnInit {
  public usuario: UsuarioFull;
  public publicaciones: Array<Publicacion> = [];
  public tipoPublicaciones: Array<TipoPublicacion> = [];
  public cargado = false;
  public previouspage = "";
  public previouslink: string | null = null;
  public url: string;
  page = 1;
  pageSize = 5;
  constructor(
    public _route: ActivatedRoute,
    public _router: Router,
    public titlecasePipe: TitleCasePipe,
    public datePipe: DatePipe,
    public _usuarioService: UsuarioService,
    public _publicacionhasusuarioService: PublicacionHasUsuarioService,
    public _publicacionService: PublicacionService,
    public _revistaService: RevistaService,
    public _autorService: AutorService,
    public _publicacionhasautorService: PublicacionHasAutorService,
    public _universidadService: UniversidadService,
    public _previousService: PreviousPageService,
    public _prefijoService: PrefijoService,
    public _tipoMiembroService: TipoMiembroService,
    public _tipoPublicacionService: TipoPublicacionService,
    public _tipotesisService: TipoTesisService,
    public _eventoService: EventoService,
    private _session: SessionService,
    public location: Location,
    private titleService: Title,
  ) {
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
          this.searchPublicacionHasUsuario(this.usuario.DNI ?? "");
          this.getPrefijos();
          this.getTipoMiembros();
        }
      });
    });
  }

  searchPublicacionHasUsuario(DNI: string) {
    this._publicacionhasusuarioService.searchPublicacionHasUsuario(DNI).subscribe((res: any) => {
      if (res.length > 0) {
        res.sort((a: any, b: any) =>
          (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
            ? 1
            : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
              ? -1
              : 0,
        );
        for (let index = 0; index < res.length; index++) {
          this.getPublicacion(res[index].publicacion_idPublicacion);
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
        for (let index = 0; index < res.length; index++) {
          if (this.publicaciones.findIndex((x) => x.idPublicacion === res[index].idPublicacion) === -1) {
            this.publicaciones.push(res[index]);
          }
        }
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index], index);
        }
        this.cargado = true;
      }
    });
  }

  getTipoTesis(publicacion: any) {
    this._tipotesisService.getTiposTesis().subscribe((res: any) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          if (publicacion.tipoTesis_idTipoTesis == res[index].idTipoTesis) {
            publicacion.tipoTesis = res[index].nombre;
          }
        }
      }
    });
  }

  fillPublicacion(publicacion: any, index: number) {
    publicacion.usuario = [];
    publicacion.autor = [];
    const d = new Date(publicacion.fechaPublicacion ?? "");
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    publicacion.fechaPublicacion = d;
    publicacion.fecha = this.datePipe.transform(publicacion.fechaPublicacion, "MMMM y") ?? "";
    publicacion.fecha = this.titlecasePipe.transform(publicacion.fecha ?? "");
    for (let tipoIndex = 0; tipoIndex < this.tipoPublicaciones.length; tipoIndex++) {
      if (publicacion.tipoPublicacion_idTipoPublicacion === this.tipoPublicaciones[tipoIndex].idTipoPublicacion) {
        publicacion.tipoPublicacion = this.tipoPublicaciones[tipoIndex].nombre;
      }
    }
    this.getUniversidad(publicacion);
    this.getRevista(publicacion);
    this.getPublicacionHasAutor(publicacion.idPublicacion ?? 0, index);
    this.getPublicacionHasUsuario(publicacion.idPublicacion ?? 0, index);
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

  getPublicacionHasUsuario(idPublicacion: number, i: number) {
    this._publicacionhasusuarioService.getPublicacionHasUsuario(idPublicacion).subscribe((res: any) => {
      for (let index = 0; index < res.length; index++) {
        this.getUsuario(res[index].usuario_DNI, i, res[index].isPrincipal);
      }
    });
  }

  getPublicacionHasAutor(idPublicacion: number, i: number) {
    this._publicacionhasautorService.getPublicacionHasAutor(idPublicacion).subscribe((res: any) => {
      for (let index = 0; index < res.length; index++) {
        this.getAutores(res[index].autores_idAutor, i);
      }
    });
  }

  getRevista(publicacion: any) {
    this._revistaService.getRevista(publicacion.revista_idRevista ?? 0).subscribe((res: any) => {
      if (res) {
        if (res[0] != undefined) {
          publicacion.revista = res[0].nombre;
        }
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

  getUsuario(idUser: string, i: number, isPrincipal: number) {
    this._usuarioService.getUser(idUser).subscribe((res: any) => {
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

  return(): void {
    this._router.navigate([this.previouslink ?? "/home"]);
  }

  getAutores(idAutor: number, i: number) {
    this._autorService.getAuthor(idAutor).subscribe((res: any) => {
      if (this.publicaciones[i].autor?.findIndex((x: any) => x.idAutor === res[0].idAutor) == -1) {
        this.publicaciones[i].autor.push(res[0]);
      }
      this.fillAuthName(this.publicaciones[i]);
    });
  }

  fillName(obj: any) {
    for (let index = 0; index < obj.usuario.length; index++) {
      const first = (obj.usuario[index].nombre ?? "").split(" ");
      if (index == obj.usuario.length - 1 && obj.autor.length === 0) {
        obj.usuario[index].nombreCompleto = first[0] + " " + obj.usuario[index].apellidoPaterno;
      } else {
        obj.usuario[index].nombreCompleto = first[0] + " " + obj.usuario[index].apellidoPaterno + ",";
      }
    }
  }

  fillAuthName(obj: any) {
    for (let index = 0; index < obj.autor.length; index++) {
      if (index == obj.autor.length - 1) {
        obj.autor[index].nombreAutor = obj.autor[index].nombre;
      } else {
        obj.autor[index].nombreAutor = obj.autor[index].nombre + ",";
      }
    }
  }

  getPrefijos() {
    this._prefijoService.getPrefijos().subscribe((res: any) => {
      if (res) {
        for (let j = 0; j < res.length; j++) {
          if (
            this.usuario.prefijo_idPrefijo == res[j].idPrefijo &&
            res[j].nombre != "Ninguno" &&
            res[j].nombre != "Bachiller"
          ) {
            this.usuario.prefijo = res[j].nombre;
          }
        }
      }
    });
  }

  getTipoMiembros() {
    this._tipoMiembroService.getTipoMiembros().subscribe((res: any) => {
      if (res) {
        for (let index = 0; index < res.length; index++) {
          if (this.usuario.tipoMiembro_idTipoMiembro === res[index].idTipoMiembro) {
            this.usuario.tipoMiembro = res[index].nombreSingular;
          }
        }
      }
    });
  }

  profile(user: any): void {
    if (!user?.DNI) {
      return;
    }
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(["/home/detail-member/" + user.DNI]);
    this.getTipoPublicacion();
  }
}
