import { TitleCasePipe, DatePipe, NgFor, NgIf, NgClass, SlicePipe } from "@angular/common";
import { Location } from "@angular/common";
import { Component, OnInit, HostListener } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute, Params } from "@angular/router";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

import { Proyecto } from "../models/proyecto";
import { NewsComponent } from "../news/news.component";
import { FuenteFinanciamientoService } from "../services/fuentefinanciamiento.service";
import { GLOBAL } from "../services/global";
import { GrupoService } from "../services/grupo.service";
import { LineasInvestigacionService } from "../services/lineasinvestigacion.service";
import { MonedaService } from "../services/moneda.service";
import { ProyectoService } from "../services/proyecto.service";
import { SearchService } from "../services/search.service";
import { UsuarioService } from "../services/usuario.service";
import { UsuarioHasProyectoService } from "../services/usuariohasproyecto";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.scss"],
  imports: [
    MatIcon,
    MatTabGroup,
    NgFor,
    MatTab,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    MatProgressSpinner,
    NgClass,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NewsComponent,
    SlicePipe,
  ],
})
export class ProjectsComponent implements OnInit {
  public proyectos: Array<Proyecto>;
  public tipoProyectos: Array<String>;
  allCharged;
  public searchForm: FormGroup;
  public url;
  infoText;

  constructor(
    public fb: FormBuilder,
    public titlecasePipe: TitleCasePipe,
    public datePipe: DatePipe,
    private _proyectoServices: ProyectoService,
    private _lineasInvestigacionServices: LineasInvestigacionService,
    private _usuarioHasProyectoService: UsuarioHasProyectoService,
    private _usuarioService: UsuarioService,
    public location: Location,
    public _route: ActivatedRoute,
    public _router: Router,
    public _searchService: SearchService,
    public _fuenteFinanciamientoService: FuenteFinanciamientoService,
    public _monedaService: MonedaService,
    public _grupoService: GrupoService,
    private titleService: Title,
  ) {
    this.searchForm = this.fb.group({
      titulo: [""],
    });
  }
  language;
  public page;
  public pageSize;
  screenWidth;
  searchText;
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.screenWidth = window.innerWidth;
    this.setSearchText();
  }
  ngOnInit() {
    this.language = JSON.parse(localStorage.getItem("language"));
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

  ngDoCheck() {
    if (this.tipoProyectos) {
      this.tipoProyectos[0] = this.language.projectsText[0].projectsType1;
      this.tipoProyectos[1] = this.language.projectsText[0].projectsType2;
    }
  }

  getGrupo() {
    this._grupoService.getGrupoInfo().subscribe((res) => {
      if (res.length > 0) {
        this.infoText = res[0].seccionProyectos;
      }
    });
  }

  setSearchText() {
    this.searchText = this.language.projectsText[0].placeholderMobile;
    if (this.screenWidth > 960) {
      this.searchText = this.language.projectsText[0].placeholder;
    }
  }

  /* Request Publicaciones at Tab Change */
  changeTab($event) {
    let estado = 0;
    if ($event.index == 0) {
      estado = 1;
    }
    this.allCharged = null;
    this.proyectos = [];
    this.getProyectos(estado);
  }

  scroll() {
    let el = document.getElementById("main-toolbar");
    el.scrollIntoView({ behavior: "smooth" });
  }

  getProyectos(estado) {
    this._proyectoServices.getProyectos(estado).subscribe((res) => {
      if (res.length > 0) {
        res.sort((a, b) => (a.fechaInicio < b.fechaInicio ? 1 : b.fechaInicio < a.fechaInicio ? -1 : 0));
        this.tipoProyectos = [];
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

  getLineasInvestigacion(idLinea, index) {
    this._lineasInvestigacionServices.getLineaInvestigacion(idLinea).subscribe((res) => {
      if (res.length > 0) {
        if (this.proyectos[index] != undefined) {
          this.proyectos[index].lineasInvestigacion = res[0].nombre;
        }
      }
    });
  }
  selectedItem;
  oldValue;

  listClick(event, newValue) {
    this.oldValue = this.selectedItem;
    this.selectedItem = newValue;
    document.getElementById("abstract" + newValue).innerText = this.language.projectsText[0].seeLess;
    if (this.selectedItem == this.oldValue) {
      this.selectedItem = -1;
      document.getElementById("abstract" + this.oldValue).innerText = this.language.projectsText[0].seeMore;
    }
  }

  /* Fill proyecto data */

  fillProyecto(proyecto, index) {
    var d = new Date(proyecto.fechaInicio);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    proyecto.fechaI = this.datePipe.transform(d, "MMMM, y", "es");
    proyecto.fechaI = this.titlecasePipe.transform(proyecto.fechaI);
    proyecto.usuario = [];
    if (proyecto.fechaFin) {
      d = new Date(proyecto.fechaFin);
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      proyecto.fechaF = this.datePipe.transform(proyecto.fechaFin, "MMMM, y", "es");
      proyecto.fechaF = this.titlecasePipe.transform(proyecto.fechaF);
    }
    this.getLineasInvestigacion(proyecto.lineasInvestigacion_idLineasInvestigacion, index);
    this.getUsuarioHasProyecto(proyecto);
    this.getFuenteFinanciamiento(proyecto);
    this.getMoneda(proyecto);
  }

  getFuenteFinanciamiento(proyecto) {
    this._fuenteFinanciamientoService
      .getFuenteFinanciamiento(proyecto.fuenteFinanciamiento_idFuenteFinanciamiento)
      .subscribe((res) => {
        if (res.length > 0) {
          proyecto.fuenteFinanciamiento = res[0].nombre;
        }
      });
  }

  getMoneda(proyecto) {
    this._monedaService.getMoneda(proyecto.moneda_idMoneda).subscribe((res) => {
      if (res.length > 0) {
        proyecto.moneda = res[0].simbolo;
      }
    });
  }

  getUsuarioHasProyecto(proyecto) {
    this._usuarioHasProyectoService.getUsuarioHasProyectos(proyecto.idProyecto).subscribe((res) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getUsuario(res[index].usuario_DNI, proyecto);
        }
      }
    });
  }

  getUsuario(idUsuario, proyecto) {
    this._usuarioService.getUser(idUsuario).subscribe((res) => {
      if (res) {
        if (proyecto.usuario.findIndex((x) => x.DNI === res[0].DNI) == -1) {
          res[0].nombre = res[0].nombre.slice(0, 1) + ".";
          proyecto.usuario.push(res[0]);
          this.fillName(proyecto);
        }
      }
    });
  }

  fillName(obj) {
    for (let index = 0; index < obj.usuario.length; index++) {
      let first = obj.usuario[index].nombre.split(" ");
      if (index == obj.usuario.length - 1) {
        obj.usuario[index].nombreCompleto = first[0] + " " + obj.usuario[index].apellidoPaterno;
      } else {
        obj.usuario[index].nombreCompleto = first[0] + " " + obj.usuario[index].apellidoPaterno + ",";
      }
    }
  }

  profile(user) {
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(["/home/detail-member/" + user.DNI]);
  }

  /* Search Methods */

  getProyectoLinea(idLineaInvestigacion, estado) {
    this._proyectoServices.getProyectosLinea(idLineaInvestigacion, estado).subscribe((res) => {
      if (res.length > 0) {
        if (this.proyectos) {
          for (let index = 0; index < res.length; index++) {
            if (this.proyectos.findIndex((x) => x.idProyecto === res[index].idProyecto) == -1) {
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

  getProyectoId(idProyecto, estado) {
    this._proyectoServices.getProyectosId(idProyecto, estado).subscribe((res) => {
      if (res.length > 0) {
        res.sort((a, b) => (a.fechaInicio < b.fechaInicio ? 1 : b.fechaInicio < a.fechaInicio ? -1 : 0));
        if (this.proyectos) {
          for (let index = 0; index < res.length; index++) {
            if (this.proyectos.findIndex((x) => x.idProyecto === res[index].idProyecto) == -1) {
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

  search(nombre, index) {
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

  searchProyectos(nombre, estado) {
    this._searchService.searchProyectos(nombre, estado).subscribe((res) => {
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

  searchLineasInvestigacion(nombre, estado) {
    this._searchService.searchLineasInvestigacion(nombre).subscribe((res) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getProyectoLinea(res[index].idLineasInvestigacion, estado);
        }
      }
      this.searchResponsables(nombre, estado);
    });
  }

  searchResponsables(nombre, estado) {
    this._searchService.searchUsuarios(nombre).subscribe((res) => {
      this.allCharged = true;
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getUsuarioHasProyectoId(res[0].DNI, estado);
        }
      }
    });
  }

  getUsuarioHasProyectoId(DNI, estado) {
    this._usuarioHasProyectoService.getUsuarioHasProyecto(DNI).subscribe((res) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getProyectoId(res[index].proyecto_idProyecto, estado);
        }
      }
    });
  }
}
