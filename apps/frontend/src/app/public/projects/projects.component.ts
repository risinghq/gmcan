import { TitleCasePipe, DatePipe, SlicePipe } from "@angular/common";
import { Location } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit, HostListener, inject } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { Proyecto } from "@app/shared/models/proyecto";
import { FuenteFinanciamientoService } from "@app/shared/services/fuentefinanciamiento.service";
import { GLOBAL } from "@app/shared/services/global";
import { GrupoService } from "@app/shared/services/grupo.service";
import { LineasInvestigacionService } from "@app/shared/services/lineasinvestigacion.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { ProyectoService } from "@app/shared/services/proyecto.service";
import { SessionService } from "@app/shared/services/session.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { UsuarioHasProyectoService } from "@app/shared/services/usuariohasproyecto";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
  imports: [
    MatIcon,
    MatTabGroup,
    MatTab,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinner,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NewsComponent,
    SlicePipe,
  ],
})
export default class ProjectsComponent implements OnInit {
  fb = inject(FormBuilder);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  private _proyectoServices = inject(ProyectoService);
  private _lineasInvestigacionServices = inject(LineasInvestigacionService);
  private _usuarioHasProyectoService = inject(UsuarioHasProyectoService);
  private _usuarioService = inject(UsuarioService);
  location = inject(Location);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  private http = inject(HttpClient);
  _fuenteFinanciamientoService = inject(FuenteFinanciamientoService);
  lookup = inject(LookupService);
  _grupoService = inject(GrupoService);
  private _session = inject(SessionService);
  private titleService = inject(Title);

  public proyectos: Proyecto[] = [];
  public tipoProyectos: string[] = [];
  allCharged: boolean | null = false;
  public searchForm: FormGroup;
  public url: string = GLOBAL.url;
  infoText = "";

  constructor() {
    this.searchForm = this.fb.group({
      titulo: [""],
    });
  }
  language: any = {};
  public page = 1;
  public pageSize = 5;
  screenWidth = 0;
  searchText = "";
  @HostListener("window:resize", ["$event"])
  onResize(_event: Event): void {
    this.screenWidth = window.innerWidth;
    this.setSearchText();
  }
  ngOnInit(): void {
    this.language = this._session.getLanguageData<any>() ?? {};
    this.titleService.setTitle("GMCAN | " + this.language.projects);
    this.screenWidth = window.innerWidth;
    this.url = GLOBAL.url;
    this.proyectos = [];
    this.page = 1;
    this.pageSize = 5;
    this.setSearchText();
    this.getProyectos(1);
    this.getGrupo();
  }

  ngDoCheck(): void {
    if (this.tipoProyectos) {
      this.tipoProyectos[0] = this.language.projectsText[0].projectsType1;
      this.tipoProyectos[1] = this.language.projectsText[0].projectsType2;
    }
  }

  getGrupo(): void {
    this._grupoService.getGrupoInfo().subscribe((res: any[]) => {
      if (res.length > 0) {
        this.infoText = res[0].seccionProyectos;
      }
    });
  }

  setSearchText(): void {
    this.searchText = this.language.projectsText[0].placeholderMobile;
    if (this.screenWidth > 960) {
      this.searchText = this.language.projectsText[0].placeholder;
    }
  }

  /* Request Publicaciones at Tab Change */
  changeTab($event: { index: number }): void {
    let estado = 0;
    if ($event.index == 0) {
      estado = 1;
    }
    this.allCharged = null;
    this.proyectos = [];
    this.getProyectos(estado);
  }

  scroll(): void {
    const el = document.getElementById("main-toolbar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  getProyectos(estado: number): void {
    this._proyectoServices.getProyectos(estado).subscribe((res: Proyecto[]) => {
      if (res.length > 0) {
        res.sort((a: Proyecto, b: Proyecto) =>
          (a.fechaInicio ?? "") < (b.fechaInicio ?? "") ? 1 : (b.fechaInicio ?? "") < (a.fechaInicio ?? "") ? -1 : 0,
        );
        this.proyectos = res;
        this.tipoProyectos.push(this.language.projectsText[0].projectsType1);
        this.tipoProyectos.push(this.language.projectsText[0].projectsType2);
        for (let index = 0; index < this.proyectos.length; index++) {
          this.fillProyecto(this.proyectos[index], index);
        }
      }
      this.allCharged = true;
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
  selectedItem = -1;
  oldValue = -1;

  listClick(_event: Event, newValue: number): void {
    this.oldValue = this.selectedItem;
    this.selectedItem = newValue;
    const current = document.getElementById("abstract" + newValue);
    if (current) {
      current.innerText = this.language.projectsText[0].seeLess;
    }
    if (this.selectedItem == this.oldValue) {
      this.selectedItem = -1;
      const previous = document.getElementById("abstract" + this.oldValue);
      if (previous) {
        previous.innerText = this.language.projectsText[0].seeMore;
      }
    }
  }

  /* Fill proyecto data */

  fillProyecto(proyecto: Proyecto, index: number): void {
    let d = new Date(proyecto.fechaInicio ?? new Date());
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    proyecto.fechaI = this.datePipe.transform(d, "MMMM, y", "es") ?? undefined;
    proyecto.fechaI = this.titlecasePipe.transform(proyecto.fechaI ?? "");
    proyecto.usuario = [];
    if (proyecto.fechaFin) {
      d = new Date(proyecto.fechaFin);
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      proyecto.fechaF = this.datePipe.transform(proyecto.fechaFin, "MMMM, y", "es") ?? undefined;
      proyecto.fechaF = this.titlecasePipe.transform(proyecto.fechaF ?? "");
    }
    this.getLineasInvestigacion(proyecto.lineasInvestigacion_idLineasInvestigacion ?? 0, index);
    this.getUsuarioHasProyecto(proyecto);
    this.getFuenteFinanciamiento(proyecto);
    this.getMoneda(proyecto);
  }

  getFuenteFinanciamiento(proyecto: Proyecto): void {
    this._fuenteFinanciamientoService
      .getFuenteFinanciamiento(proyecto.fuenteFinanciamiento_idFuenteFinanciamiento ?? 0)
      .subscribe((res: any[]) => {
        if (res.length > 0) {
          proyecto.fuenteFinanciamiento = res[0].nombre;
        }
      });
  }

  getMoneda(proyecto: Proyecto): void {
    const found = this.lookup.monedas().find((m) => m.idMoneda === proyecto.moneda_idMoneda);
    if (found) proyecto.moneda = found.simbolo;
  }

  getUsuarioHasProyecto(proyecto: Proyecto): void {
    this._usuarioHasProyectoService.getUsuarioHasProyectos(proyecto.idProyecto ?? 0).subscribe((res: any[]) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getUsuario(res[index].usuario_DNI, proyecto);
        }
      }
    });
  }

  getUsuario(idUsuario: string, proyecto: Proyecto): void {
    this._usuarioService.getUser(idUsuario).subscribe((res: any[]) => {
      if (res) {
        if (proyecto.usuario?.findIndex((x: any) => x.DNI === res[0].DNI) == -1) {
          res[0].nombre = res[0].nombre.slice(0, 1) + ".";
          proyecto.usuario.push(res[0]);
          this.fillName(proyecto);
        }
      }
    });
  }

  fillName(obj: Proyecto): void {
    if (!obj.usuario) {
      return;
    }
    for (let index = 0; index < obj.usuario.length; index++) {
      const first = (obj.usuario[index].nombre ?? "").split(" ");
      if (index == obj.usuario.length - 1) {
        obj.usuario[index].nombreCompleto = first[0] + " " + obj.usuario[index].apellidoPaterno;
      } else {
        obj.usuario[index].nombreCompleto = first[0] + " " + obj.usuario[index].apellidoPaterno + ",";
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

  /* Search Methods */

  getProyectoLinea(idLineaInvestigacion: number, estado: number): void {
    this._proyectoServices.getProyectosLinea(idLineaInvestigacion, estado).subscribe((res: Proyecto[]) => {
      if (res.length > 0) {
        if (this.proyectos) {
          for (let index = 0; index < res.length; index++) {
            if (this.proyectos.findIndex((x: Proyecto) => x.idProyecto === res[index].idProyecto) == -1) {
              this.proyectos.push(res[index]);
            }
          }
        } else {
          this.proyectos = res;
        }
      }
      for (let index = 0; index < this.proyectos.length; index++) {
        if (this.proyectos[index] != undefined) {
          this.fillProyecto(this.proyectos[index], index);
        }
      }
    });
  }

  getProyectoId(idProyecto: number, estado: number): void {
    this._proyectoServices.getProyectosId(idProyecto, estado).subscribe((res: Proyecto[]) => {
      if (res.length > 0) {
        res.sort((a: Proyecto, b: Proyecto) =>
          (a.fechaInicio ?? "") < (b.fechaInicio ?? "") ? 1 : (b.fechaInicio ?? "") < (a.fechaInicio ?? "") ? -1 : 0,
        );
        if (this.proyectos) {
          for (let index = 0; index < res.length; index++) {
            if (this.proyectos.findIndex((x: Proyecto) => x.idProyecto === res[index].idProyecto) == -1) {
              this.proyectos.push(res[index]);
            }
          }
        } else {
          this.proyectos = res;
        }
      }
      for (let index = 0; index < this.proyectos.length; index++) {
        if (this.proyectos[index] != undefined) {
          this.fillProyecto(this.proyectos[index], index);
        }
      }
    });
  }

  search(nombre: string, index: number): void {
    this.proyectos = [];
    let estado = 0;
    this.allCharged = null;
    if (index == 0) {
      estado = 1;
    }
    if (nombre != "") {
      this.searchProyectos(nombre, estado);
    } else {
      this.getProyectos(estado);
    }
  }

  searchProyectos(nombre: string, estado: number): void {
    this.http.post<Proyecto[]>(`${GLOBAL.url}proyecto/search-proyecto`, { nombre, estado }).subscribe((res) => {
      if (res.length > 0) {
        this.proyectos = res;
        for (let index = 0; index < this.proyectos.length; index++) {
          if (this.proyectos[index] != undefined && this.proyectos[index].estado == estado) {
            this.fillProyecto(this.proyectos[index], index);
          } else {
            this.proyectos.splice(index, 1);
          }
        }
      }
      this.searchLineasInvestigacion(nombre, estado);
    });
  }

  searchLineasInvestigacion(nombre: string, estado: number): void {
    this.http
      .post<{ idLineasInvestigacion: number }[]>(`${GLOBAL.url}lineasinvestigacion/search-lineasinvestigacion`, {
        nombre,
      })
      .subscribe((res) => {
        if (res.length > 0) {
          for (const linea of res) {
            this.getProyectoLinea(linea.idLineasInvestigacion, estado);
          }
        }
        this.searchResponsables(nombre, estado);
      });
  }

  searchResponsables(nombre: string, estado: number): void {
    this.http.post<{ DNI: string }[]>(`${GLOBAL.url}usuario/search-usuarios`, { nombre }).subscribe((res) => {
      this.allCharged = true;
      if (res.length > 0) {
        for (const user of res) {
          this.getUsuarioHasProyectoId(user.DNI, estado);
        }
      }
    });
  }

  getUsuarioHasProyectoId(DNI: string, estado: number): void {
    this._usuarioHasProyectoService.getUsuarioHasProyecto(DNI).subscribe((res: any[]) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getProyectoId(res[index].proyecto_idProyecto, estado);
        }
      }
    });
  }
}
