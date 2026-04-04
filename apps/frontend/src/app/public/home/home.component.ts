import { TitleCasePipe, DatePipe, SlicePipe } from "@angular/common";
import { Location } from "@angular/common";
import { Component, OnInit, HostListener, inject } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatCard } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatProgressBar } from "@angular/material/progress-bar";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { createGrupo, createNoticia } from "@app/shared/models/factories";
import type { Grupo } from "@app/shared/models/grupo";
import type { LineasInvestigacion } from "@app/shared/models/lineaInvestigacion";
import { Method } from "@app/shared/models/method";
import type { Noticia } from "@app/shared/models/noticia";
import type { Proyecto } from "@app/shared/models/proyecto";
import type { Publicacion } from "@app/shared/models/publicacion";
import type { TipoNoticia } from "@app/shared/models/tiponoticia";
import type { TipoPublicacion } from "@app/shared/models/tipopublicacion";
import { Usuario } from "@app/shared/models/usuario";
import { AboutUsService } from "@app/shared/services/aboutus.service";
import { EventoService } from "@app/shared/services/evento.service";
import { FuenteFinanciamientoService } from "@app/shared/services/fuentefinanciamiento.service";
import { GLOBAL } from "@app/shared/services/global";
import { GrupoService } from "@app/shared/services/grupo.service";
import { LineasInvestigacionService } from "@app/shared/services/lineasinvestigacion.service";
import { MethodsService } from "@app/shared/services/methods.service";
import { MonedaService } from "@app/shared/services/moneda.service";
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

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  imports: [MatProgressBar, MatButton, MatCard, MatIcon, SlicePipe],
})
export default class HomeComponent implements OnInit {
  _grupoService = inject(GrupoService);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _searchService = inject(SearchService);
  _publicacionAutoresService = inject(PublicacionAutoresService);
  _proyectohasusuarioService = inject(UsuarioHasProyectoService);
  _usuarioService = inject(UsuarioService);
  _revistaService = inject(RevistaService);
  _universidadService = inject(UniversidadService);
  _lineasInvestigacionServices = inject(LineasInvestigacionService);
  _proyectoServices = inject(ProyectoService);
  _tiponoticiaService = inject(TipoNoticiaService);
  _noticiaService = inject(NoticiaService);
  _eventoService = inject(EventoService);
  _tipotesisService = inject(TipoTesisService);
  _publicacionesService = inject(PublicacionService);
  _tipoPublicacionService = inject(TipoPublicacionService);
  fb = inject(FormBuilder);
  _methodsService = inject(MethodsService);
  aboutusService = inject(AboutUsService);
  location = inject(Location);
  _fuenteFinanciamientoService = inject(FuenteFinanciamientoService);
  _monedaService = inject(MonedaService);
  private _session = inject(SessionService);
  meta = inject(Meta);
  private titleService = inject(Title);

  public info: Grupo;
  public publicaciones: Array<Publicacion>;
  proyectos: Array<Proyecto>;
  public noticias: Array<Noticia>;
  public noticiaPrincipal: Noticia;
  public tipoPublicaciones: Array<TipoPublicacion> = [];
  public tiponoticias: Array<TipoNoticia>;
  public lineasInvestigacion: Array<LineasInvestigacion> = [];
  public metodos: Array<Method> = [];
  public usuarios: Array<Usuario> = [];
  screenWidth: number;
  url;
  constructor() {
    this.info = createGrupo();
    this.noticiaPrincipal = createNoticia();
    this.publicaciones = [];
    this.noticias = [];
    this.proyectos = [];
    this.tiponoticias = [];
    this.screenWidth = window.innerWidth;
    this.url = GLOBAL.url;
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: Event): void {
    this.screenWidth = window.innerWidth;
  }

  language: any;
  progress = 0;
  augment = 100 / 10;

  ngOnInit(): void {
    this.language = this._session.getLanguageData<any>() ?? {};
    this.titleService.setTitle("GMCAN | UNMSM");
    this.getGrupoInfo();
    this.getTipoPublicacion();
    this.getProyectos();
    this.getTipoNoticias();
    this.getAllLineasInvestigacion();
    this.getMetodos();
    this.getUsuarios();
  }

  llenado = false;

  ngAfterViewChecked(): void {
    if (this.metodos && !this.llenado) {
      for (let index = 0; index < this.metodos.length; index++) {
        const methodEl = document.getElementById("method" + index);
        if (methodEl) {
          methodEl.innerHTML = this.metodos[index].descripcion ?? "";
        }
      }
      this.llenado = true;
    }
  }

  /* Get Grupo */

  getGrupoInfo(): void {
    this._grupoService.getGrupoInfo().subscribe((res: any) => {
      this.info = res[0];
      this.progress = this.progress + this.augment;
      this.getAboutUs();
    });
  }

  getAboutUs(): void {
    this.aboutusService.getAboutUsInfo().subscribe((res: any) => {
      this.progress = this.progress + this.augment;
      const servicesEl = document.getElementById("services");
      if (servicesEl) {
        servicesEl.innerHTML = res[0]?.servicios ?? "";
      }
    });
  }

  /* Get Publicacion */

  getTipoPublicacion(): void {
    this._tipoPublicacionService.getTipoPublicaciones().subscribe((res: any) => {
      if (res) {
        this.tipoPublicaciones = res;
        this.progress = this.progress + this.augment;
        this.getPublicaciones();
      }
    });
  }

  resumenes = 0;
  tesis = 0;
  articulos = 0;

  getPublicaciones(): void {
    this._publicacionesService.getPublicacion().subscribe((res: any) => {
      if (res.length > 0) {
        this.progress = this.progress + this.augment;
        res.sort((a: any, b: any) =>
          (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
            ? 1
            : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
              ? -1
              : 0,
        );
        this.publicaciones = res;
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index]);
          if (this.publicaciones[index].tipoPublicacion_idTipoPublicacion === 1) {
            this.articulos++;
          }
          if (this.publicaciones[index].tipoPublicacion_idTipoPublicacion === 2) {
            this.tesis++;
          }
          if (this.publicaciones[index].tipoPublicacion_idTipoPublicacion === 3) {
            this.resumenes++;
          }
        }
        this.startCounter();
      }
    });
  }

  getEvento(idEvento: number, publicacion: any): void {
    this._eventoService.getEvento(idEvento).subscribe((res: any) => {
      if (res.length > 0) {
        publicacion.evento = res[0].nombre;
        publicacion.ciudad = res[0].ciudad;
        publicacion.pais = res[0].pais;
      }
    });
  }

  getTipoTesis(publicacion: any): void {
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

  /* Fill Publicacion */

  fillPublicacion(publicacion: any): void {
    publicacion.autor = [];
    const d = new Date(publicacion.fechaPublicacion ?? "");
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    publicacion.fechaPublicacion = d;
    publicacion.fecha = this.datePipe.transform(publicacion.fechaPublicacion, "MMMM y", "es") ?? undefined;
    publicacion.fecha = this.titlecasePipe.transform(publicacion.fecha ?? "");
    publicacion.tipoPublicacion =
      this.tipoPublicaciones[
        this.tipoPublicaciones.findIndex((x) => x.idTipoPublicacion === publicacion.tipoPublicacion_idTipoPublicacion)
      ].nombre;
    this._publicacionAutoresService.getForPublication(publicacion.idPublicacion ?? 0).subscribe((authors) => {
      publicacion.autor = authors;
    });
    this.getUniversidad(publicacion);
    this.getRevista(publicacion);
    this.getEvento(publicacion.evento_idEvento ?? 0, publicacion);
    this.getTipoTesis(publicacion);
  }

  /* get Proyectos */

  getProyectosHasUsuario(proyecto: any): void {
    this._proyectohasusuarioService.getUsuarioHasProyectos(proyecto.idProyecto ?? 0).subscribe((res: any) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getUsuario(res[index].usuario_DNI, proyecto, 0);
        }
      }
    });
  }

  getLineasInvestigacion(idLinea: number, index: number): void {
    this._lineasInvestigacionServices.getLineaInvestigacion(idLinea).subscribe((res: any) => {
      if (res.length > 0) {
        if (this.proyectos[index] != undefined) {
          this.proyectos[index].lineasInvestigacion = res[0].nombre;
        }
      }
    });
  }

  getProyectos(): void {
    this._proyectoServices.getProyecto().subscribe((res: any) => {
      if (res.length > 0) {
        res.sort((a: any, b: any) =>
          (a.fechaInicio ?? "") < (b.fechaInicio ?? "") ? 1 : (b.fechaInicio ?? "") < (a.fechaInicio ?? "") ? -1 : 0,
        );
        this.proyectos = res;
        this.progress = this.progress + this.augment;
        for (let index = 0; index < this.proyectos.length; index++) {
          if (this.proyectos[index].fechaFin) {
            this.proyectos.splice(index, 1);
            index--;
          } else {
            this.fillProyecto(this.proyectos[index], index);
          }
        }
      }
    });
  }

  getFuenteFinanciamiento(proyecto: any): void {
    this._fuenteFinanciamientoService
      .getFuenteFinanciamiento(proyecto.fuenteFinanciamiento_idFuenteFinanciamiento ?? 0)
      .subscribe((res: any) => {
        if (res.length > 0) {
          proyecto.fuenteFinanciamiento = res[0].nombre;
        }
      });
  }

  getMoneda(proyecto: any): void {
    this._monedaService.getMoneda(proyecto.moneda_idMoneda ?? 0).subscribe((res: any) => {
      if (res.length > 0) {
        proyecto.moneda = res[0].simbolo;
      }
    });
  }

  /* Fill Proyecto */

  fillProyecto(proyecto: any, index: number): void {
    let d = new Date(proyecto.fechaInicio ?? "");
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    proyecto.fechaInicio = d;
    proyecto.fechaI = this.datePipe.transform(proyecto.fechaInicio, "MMMM, y", "es") ?? undefined;
    proyecto.fechaI = this.titlecasePipe.transform(proyecto.fechaI ?? "");
    proyecto.usuario = [];
    if (proyecto.fechaFin) {
      d = new Date(proyecto.fechaFin);
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      proyecto.fechaFin = d;
      proyecto.fechaF = this.datePipe.transform(proyecto.fechaFin, "MMMM, y", "es") ?? undefined;
      proyecto.fechaF = this.titlecasePipe.transform(proyecto.fechaF ?? "");
    }
    this.getLineasInvestigacion(proyecto.lineasInvestigacion_idLineasInvestigacion ?? 0, index);
    this.getProyectosHasUsuario(proyecto);
    this.getFuenteFinanciamiento(proyecto);
    this.getMoneda(proyecto);
  }

  /* get Noticias */

  getNoticias(): void {
    this._noticiaService.getNoticias().subscribe((res: any) => {
      if (res != null) {
        this.progress = this.progress + this.augment;
        res.sort((a: any, b: any) =>
          (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
            ? 1
            : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
              ? -1
              : 0,
        );
        this.noticias = res;
        for (let index = 0; index < this.noticias.length; index++) {
          if (this.noticias[index].estado == 0) {
            this.noticias.splice(index, 1);
            index--;
          }
        }
        console.log(this.noticias);
        for (let index = 0; index < this.noticias.length; index++) {
          this.fillNoticia(this.noticias[index]);
        }
        this.noticiaPrincipal = this.noticias[0];
        this.fillNoticia(this.noticiaPrincipal);
      }
    });
  }

  getTipoNoticias(): void {
    this._tiponoticiaService.getTipoNoticia().subscribe((res: any) => {
      this.progress = this.progress + this.augment;
      this.tiponoticias = res;
      this.getNoticias();
    });
  }

  /* Fill Noticia */

  fillNoticia(obj: any): void {
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

  /* get Lineas Investigacion */

  getAllLineasInvestigacion(): void {
    this._lineasInvestigacionServices.getLineasInvestigacion().subscribe((res: any) => {
      if (res) {
        this.progress = this.progress + this.augment;
        this.lineasInvestigacion = res;
      }
    });
  }

  /* get Metodos */

  getMetodos(): void {
    this._methodsService.getMethods().subscribe((res: any) => {
      if (res) {
        this.progress = this.progress + this.augment;
        this.metodos = res;
      }
    });
  }

  /*  Get Normal */

  getUsuario(dni: string, obj: any, isPrincipal: number): void {
    this._usuarioService.getUser(dni).subscribe((res: any) => {
      res[0].isPrincipal = isPrincipal;
      if (res) {
        if (obj.usuario.findIndex((x: any) => x.DNI === res[0].DNI) == -1) {
          res[0].nombre = res[0].nombre.slice(0, 1) + ".";
          obj.usuario.push(res[0]);
        }
        obj.usuario.sort((a: any, b: any) =>
          (a.isPrincipal ?? 0) > (b.isPrincipal ?? 0) ? 1 : (b.isPrincipal ?? 0) > (a.isPrincipal ?? 0) ? -1 : 0,
        );
        for (let i = 0; i < obj.usuario.length; i++) {
          const first = (obj.usuario[i].nombre ?? "").split(" ");
          obj.usuario[i].nombreCompleto =
            first[0] + " " + obj.usuario[i].apellidoPaterno + (i < obj.usuario.length - 1 ? "," : "");
        }
      }
    });
  }

  getUsuarioNoticia(obj: any): void {
    this._usuarioService.getUser(obj.autorPublicacion ?? "").subscribe((res: any) => {
      if (res[0] != undefined) {
        obj.autor = res[0].nombre + " " + res[0].apellidoPaterno;
      }
    });
  }

  getRevista(publicacion: any): void {
    this._revistaService.getRevista(publicacion.revista_idRevista ?? 0).subscribe((res: any) => {
      if (res) {
        if (res[0] != undefined) {
          publicacion.revista = res[0].nombre;
        }
      }
    });
  }

  getUniversidad(publicacion: any): void {
    this._universidadService.getUniversidad(publicacion.universidad_idUniversidad ?? 0).subscribe((res: any) => {
      if (res && res[0] != undefined) {
        publicacion.universidad = res[0].nombre;
      }
    });
  }

  /* getUsuarios */

  getUsuarios() {
    this._usuarioService.getUsuarios().subscribe((res) => {
      this.progress = this.progress + this.augment;
      for (let index = 0; index < res.length; index++) {
        if (res[index].estado != 1) {
          res.splice(index, 1);
          index--;
        }
      }
      this.usuarios = res;
      this.startCounter();
    });
  }

  publicationLink(_value: unknown): void {}

  /* Animation counter */
  steps = 12;
  counterFunc(endValue: number, durationMs: number, element: HTMLElement | null): void {
    if (!element) {
      return;
    }
    const target: HTMLElement = element;
    if (!this.steps) {
      this.steps = 12;
    }

    const stepCount = Math.abs(durationMs / this.steps);
    const valueIncrement = (endValue - 0) / stepCount;
    const sinValueIncrement = Math.PI / stepCount;

    let currentValue = 0;
    let currentSinValue = 0;

    function step() {
      currentSinValue += sinValueIncrement;
      currentValue += valueIncrement * Math.sin(currentSinValue) ** 2 * 2;

      target.innerText = String(Math.abs(Math.floor(currentValue)));

      if (currentSinValue < Math.PI) {
        window.requestAnimationFrame(step);
      }
    }

    step();
  }

  startCounter(): void {
    if (this.usuarios.length > 0 && this.resumenes > 0 && this.tesis > 0 && this.articulos > 0) {
      this.counterFunc(this.usuarios.length, 1000, document.getElementById("users"));
      this.counterFunc(this.resumenes, 1000, document.getElementById("resumenes"));
      this.counterFunc(this.tesis, 1000, document.getElementById("tesis"));
      this.counterFunc(this.articulos, 1000, document.getElementById("articulos"));
    }
  }

  navigate(route: string): void {
    this._router.navigate([route]);
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
    this.scroll(document.getElementById("main-toolbar"));
  }

  scroll(el: HTMLElement | null): void {
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  /* Hovers Publicaciones */

  /* Share Hover */
  fbsharing(i: number): boolean {
    const title = String(this.publicaciones[i].titulo);
    this.meta.updateTag({ name: "description", content: title });
    const locationhref = `${GLOBAL.appUrl}/home`;

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(locationhref)}`,
      "facebook-share-dialog",
      "width=626,height=436",
    );
    return false;
  }

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
}
