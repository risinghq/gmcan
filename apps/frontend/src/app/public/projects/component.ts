import { TitleCasePipe, DatePipe, SlicePipe } from "@angular/common";
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

import type { ProjectsViewModel } from "./types";

@Component({
  selector: "app-projects",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
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
  private readonly _fb = inject(FormBuilder);
  private readonly _titlecasePipe = inject(TitleCasePipe);
  private readonly _datePipe = inject(DatePipe);
  private readonly _proyectoServices = inject(ProyectoService);
  private readonly _lineasInvestigacionServices = inject(LineasInvestigacionService);
  private readonly _usuarioHasProyectoService = inject(UsuarioHasProyectoService);
  private readonly _usuarioService = inject(UsuarioService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _http = inject(HttpClient);
  private readonly _fuenteFinanciamientoService = inject(FuenteFinanciamientoService);
  private readonly _lookup = inject(LookupService);
  private readonly _session = inject(SessionService);
  private readonly _titleService = inject(Title);

  proyectos: Proyecto[] = [];
  tipoProyectos: string[] = [];
  allCharged: boolean | null = false;
  searchForm: FormGroup;
  url = GLOBAL.url;
  infoText = "";
  language: any = {};
  page = 1;
  pageSize = 5;
  screenWidth = 0;
  searchText = "";
  expandedKey: string | null = null;

  constructor() {
    this.searchForm = this._fb.group({
      titulo: [""],
    });
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: Event): void {
    this.screenWidth = window.innerWidth;
    this.setSearchText();
  }

  ngOnInit(): void {
    this.language = this._session.language();
    this._titleService.setTitle("GMCAN | " + this.language.projects);
    this.screenWidth = window.innerWidth;
    this.url = GLOBAL.url;
    this.page = 1;
    this.pageSize = 5;
    this.setSearchText();

    const projectsData = this._route.snapshot.data["projects"] as ProjectsViewModel;
    this.proyectos = projectsData.proyectos;
    this.infoText = projectsData.infoText;

    this.tipoProyectos.push(this.language.projectsText[0].projectsType1);
    this.tipoProyectos.push(this.language.projectsText[0].projectsType2);
    this._hydrateProjects();

    this.allCharged = true;
  }

  ngDoCheck(): void {
    if (this.tipoProyectos) {
      this.tipoProyectos[0] = this.language.projectsText[0].projectsType1;
      this.tipoProyectos[1] = this.language.projectsText[0].projectsType2;
    }
  }

  setSearchText(): void {
    this.searchText = this.language.projectsText[0].placeholderMobile;
    if (this.screenWidth > 960) {
      this.searchText = this.language.projectsText[0].placeholder;
    }
  }

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
      this.proyectos = this._sortProjects(res ?? []);
      this._hydrateProjects();
      this.allCharged = true;
    });
  }

  private _sortProjects(projects: Proyecto[]): Proyecto[] {
    return projects.toSorted((a: Proyecto, b: Proyecto) =>
      (a.fechaInicio ?? "") < (b.fechaInicio ?? "") ? 1 : (b.fechaInicio ?? "") < (a.fechaInicio ?? "") ? -1 : 0,
    );
  }

  private _hydrateProjects(): void {
    for (let index = 0; index < this.proyectos.length; index++) {
      if (this.proyectos[index] != undefined) {
        this.fillProyecto(this.proyectos[index], index);
      }
    }
  }

  private _appendUniqueProjects(projects: Proyecto[]): void {
    for (const project of projects) {
      if (this.proyectos.findIndex((current: Proyecto) => current.idProyecto === project.idProyecto) === -1) {
        this.proyectos.push(project);
      }
    }
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

  fillProyecto(proyecto: Proyecto, index: number): void {
    let d = new Date(proyecto.fechaInicio ?? new Date());
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    proyecto.fechaI = this._datePipe.transform(d, "MMMM, y", "es") ?? undefined;
    proyecto.fechaI = this._titlecasePipe.transform(proyecto.fechaI ?? "");
    proyecto.usuario = [];
    if (proyecto.fechaFin) {
      d = new Date(proyecto.fechaFin);
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      proyecto.fechaF = this._datePipe.transform(proyecto.fechaFin, "MMMM, y", "es") ?? undefined;
      proyecto.fechaF = this._titlecasePipe.transform(proyecto.fechaF ?? "");
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
    const found = this._lookup.monedas().find((m) => m.idMoneda === proyecto.moneda_idMoneda);
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
    this._router.navigate(["/home/detail-member/" + user.DNI]);
  }

  getProyectoLinea(idLineaInvestigacion: number, estado: number): void {
    this._proyectoServices.getProyectosLinea(idLineaInvestigacion, estado).subscribe((res: Proyecto[]) => {
      if (res.length > 0) {
        this._appendUniqueProjects(res);
      }
      this._hydrateProjects();
    });
  }

  getProyectoId(idProyecto: number, estado: number): void {
    this._proyectoServices.getProyectosId(idProyecto, estado).subscribe((res: Proyecto[]) => {
      if (res.length > 0) {
        this._appendUniqueProjects(this._sortProjects(res));
      }
      this._hydrateProjects();
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
    this._http
      .post<Proyecto[]>(`${GLOBAL.url}proyecto/search-proyecto`, { nombre, estado })
      .subscribe((res: Proyecto[]) => {
        if (res.length > 0) {
          this.proyectos = this._sortProjects(res.filter((project) => project.estado == estado));
          this._hydrateProjects();
        }
        this.searchLineasInvestigacion(nombre, estado);
      });
  }

  searchLineasInvestigacion(nombre: string, estado: number): void {
    this._http
      .post<{ idLineasInvestigacion: number }[]>(`${GLOBAL.url}lineasinvestigacion/search-lineasinvestigacion`, {
        nombre,
      })
      .subscribe((res: { idLineasInvestigacion: number }[]) => {
        if (res.length > 0) {
          for (const linea of res) {
            this.getProyectoLinea(linea.idLineasInvestigacion, estado);
          }
        }
        this.searchResponsables(nombre, estado);
      });
  }

  searchResponsables(nombre: string, estado: number): void {
    this._http
      .post<{ DNI: string }[]>(`${GLOBAL.url}usuario/search-usuarios`, { nombre })
      .subscribe((res: { DNI: string }[]) => {
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
