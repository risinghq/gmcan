import { TitleCasePipe, DatePipe, SlicePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import { createLineasInvestigacion } from "@app/shared/models/factories";
import type { LineasInvestigacion } from "@app/shared/models/lineaInvestigacion";
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

@Component({
  selector: "app-lines-investigation",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [MatIcon, NgbPagination, NgbPaginationPrevious, NgbPaginationNumber, NgbPaginationNext, SlicePipe],
})
export default class LinesInvestigationComponent implements OnInit {
  private _lineasInvestigacionServices = inject(LineasInvestigacionService);
  private _proyectoServices = inject(ProyectoService);
  private _usuarioHasProyectoService = inject(UsuarioHasProyectoService);
  private _usuarioService = inject(UsuarioService);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _fuenteFinanciamientoService = inject(FuenteFinanciamientoService);
  lookup = inject(LookupService);
  private _session = inject(SessionService);
  private titleService = inject(Title);

  language: any = {};

  public lineasProyecto: Array<LineasInvestigacion>;
  public page0 = 1;
  public pageSize = 5;
  public page1 = 1;
  public pageSize2 = 5;
  public page2 = 1;
  public pageSize3 = 5;
  public url = GLOBAL.url;
  constructor() {
    this.lineasProyecto = [];
    this.lineasProyecto[0] = createLineasInvestigacion();
    this.lineasProyecto[1] = createLineasInvestigacion();
    this.lineasProyecto[2] = createLineasInvestigacion();
  }

  ngOnInit(): void {
    this.language = this._session.language();
    this.titleService.setTitle("GMCAN | " + this.language.linesInvestigation);
    this.getLineasInvestigacion();
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

  getLineasInvestigacion(): void {
    this._lineasInvestigacionServices.getLineasInvestigacion().subscribe((res: any) => {
      this.lineasProyecto = res;
      for (let index = 0; index < this.lineasProyecto.length; index++) {
        this.lineasProyecto[index].proyectos = [];
        this.getProyectosLineas(this.lineasProyecto[index]);
      }
    });
  }

  getProyectosLineas(lineaProyecto: any): void {
    this._proyectoServices.getProyectosLinea(lineaProyecto.idLineasInvestigacion ?? 0, 1).subscribe((res: any) => {
      lineaProyecto.proyectos = res;
      for (let index = 0; index < lineaProyecto.proyectos.length; index++) {
        this.fillProyecto(lineaProyecto.proyectos[index]);
      }
    });
  }

  fillProyecto(proyecto: any): void {
    let d = new Date(proyecto.fechaInicio ?? "");
    if (String(d) != "Invalid Date") {
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      proyecto.fechaI = this.datePipe.transform(d, "MMMM, y", "es") ?? "";
      proyecto.fechaI = this.titlecasePipe.transform(proyecto.fechaI ?? "");
    }
    for (let index = 0; index < this.lineasProyecto.length; index++) {
      if (proyecto.lineasInvestigacion_idLineasInvestigacion === this.lineasProyecto[index].idLineasInvestigacion) {
        proyecto.lineasInvestigacion = this.lineasProyecto[index].nombre;
      }
    }
    proyecto.usuario = [];
    if (proyecto.fechaFin) {
      d = new Date(proyecto.fechaFin);
      if (String(d) != "Invalid Date") {
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        proyecto.fechaF = this.datePipe.transform(d, "MMMM, y", "es") ?? "";
        proyecto.fechaF = this.titlecasePipe.transform(proyecto.fechaF ?? "");
      }
    }
    this.getUsuarioHasProyecto(proyecto);
    this.getFuenteFinanciamiento(proyecto);
    this.getMoneda(proyecto);
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
    const found = this.lookup.monedas().find((m: { idMoneda: number }) => m.idMoneda === proyecto.moneda_idMoneda);
    if (found) proyecto.moneda = (found as { simbolo: string }).simbolo;
  }

  getUsuarioHasProyecto(proyecto: any): void {
    this._usuarioHasProyectoService.getUsuarioHasProyectos(proyecto.idProyecto ?? 0).subscribe((res: any) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getUsuario(res[index].usuario_DNI, proyecto);
        }
      }
    });
  }

  getUsuario(idUsuario: string, proyecto: any): void {
    this._usuarioService.getUser(idUsuario).subscribe((res: any) => {
      if (res) {
        res[0].nombre = res[0].nombre.slice(0, 1) + ".";
        proyecto.usuario.push(res[0]);
        this.fillName(proyecto);
      }
    });
  }

  fillName(obj: any): void {
    for (let index = 0; index < obj.usuario.length; index++) {
      const first = (obj.usuario[index].nombre ?? "").split(" ");
      if (index == obj.usuario.length - 1) {
        obj.usuario[index].nombreCompleto = first[0] + " " + obj.usuario[index].apellidoPaterno;
      } else {
        obj.usuario[index].nombreCompleto = first[0] + " " + obj.usuario[index].apellidoPaterno + ",";
      }
    }
  }

  profile(user: any): void {
    if (!user?.DNI) {
      return;
    }
    this._router.navigate(["/home/detail-member/" + user.DNI]);
  }
}
