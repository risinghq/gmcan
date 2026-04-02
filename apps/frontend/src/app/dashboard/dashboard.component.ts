import { NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { BaseChartDirective } from "ng2-charts";

import { Grupo } from "../models/grupo";
import { AuthService } from "../services/auth.service";
import { GLOBAL } from "../services/global";
import { PermisoService } from "../services/permiso.service";
import { TipoMiembroService } from "../services/tipomiembro.service";
import { TipoPublicacionService } from "../services/tipopublicacion.service";
import { UsuarioService } from "../services/usuario.service";
import { UsuarioHasPermisoService } from "../services/usuariohaspermiso.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
  imports: [NgIf, RouterLink, RouterLinkActive, BaseChartDirective],
})
export class DashboardComponent implements OnInit {
  token;
  user;
  screenWidth;
  public url;
  public grupoinfo: Grupo;
  permisos = {
    noticiaPermiso: false,
    miembroPermiso: false,
    proyectoPermiso: false,
    publicacionPermiso: false,
    contenidoPermiso: false,
    analiticaPermiso: false,
  };
  permisoUsuario;
  constructor(
    public authService: AuthService,
    public _usuarioService: UsuarioService,
    public _permisoService: PermisoService,
    public _usuarioHasPermisoService: UsuarioHasPermisoService,
    public _route: ActivatedRoute,
    public _router: Router,
    public _tipoMiembroService: TipoMiembroService,
    public _tipoPublicacionService: TipoPublicacionService,
  ) {
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getPermiso();
    this.getGrupoInfo();
    this.getCountTypeMember();
  }

  getGrupoInfo() {
    this.grupoinfo = JSON.parse(localStorage.getItem("grupoInfo"));
    this.grupoinfo.logoHeader = this.url + "grupo/get-image-grupo/" + this.grupoinfo.logoHeader;
  }

  getPermiso() {
    this._permisoService.getPermisos().subscribe((res) => {
      if (res.length > 0) {
        this.getPermisoHasUsuario(this.user.DNI);
      }
    });
  }

  getPermisoHasUsuario(DNI) {
    this._usuarioHasPermisoService.getUsuarioHasPermiso(DNI).subscribe((res) => {
      if (res.length > 0) {
        this.permisoUsuario = res;
        for (let index = 0; index < this.permisoUsuario.length; index++) {
          switch (this.permisoUsuario[index].permiso_idPermiso) {
            case 1:
              this.permisos.noticiaPermiso = true;
              break;
            case 2:
              this.permisos.proyectoPermiso = true;
              break;
            case 3:
              this.permisos.publicacionPermiso = true;
              break;
            case 4:
              this.permisos.miembroPermiso = true;
              break;
            case 5:
              this.permisos.contenidoPermiso = true;
              break;
            case 6:
              this.permisos.analiticaPermiso = true;
              break;
            default:
              break;
          }
        }
      }
    });
  }

  total = 0;
  total2 = 0;

  getCountTypeMember() {
    this._tipoMiembroService.getCountType().subscribe((res) => {
      if (res.length > 0) {
        const filler: Array<any> = [];
        const filler2: Array<any> = [];
        for (let index = 0; index < res.length; index++) {
          filler2.push(res[index].nombre);
          filler.push(res[index].Total);
          this.total = this.total + parseInt(res[index].Total);
        }
        this.chartLabels = filler2;
        this.chartDatasets = [{ data: filler, label: "My First dataset" }];
      }
      this.getCountTypePublication();
    });
  }

  getCountTypePublication() {
    this._tipoPublicacionService.getCountType().subscribe((res) => {
      if (res.length > 0) {
        const filler3: Array<any> = [];
        const filler4: Array<any> = [];
        for (let index = 0; index < res.length; index++) {
          filler4.push(res[index].nombre);
          filler3.push(res[index].Total);
          this.total2 = this.total2 + parseInt(res[index].Total);
        }
        filler3.push(0);
        this.chartLabels2 = filler4;
        this.chartDatasets2 = [{ data: filler3, label: "Cantidad" }];
      }
    });
  }

  public chartType: any = "pie";

  public chartDatasets: Array<any> = [
    {
      data: [],
      label: "My First dataset",
      backgroundColor: [
        "rgba(13,56,0,1)",
        "rgba(0,133,51,1)",
        "rgba(0,204,24,1)",
        "rgba(120,240,0,1)",
        "rgba(142,236,152,1)",
        "rgba(0,48,0,1)",
      ],
      hoverBackgroundColor: [
        "rgba(13,56,0,0.8)",
        "rgba(0,133,51,0.8)",
        "rgba(0,204,24,0.8)",
        "rgba(120,240,0,0.8)",
        "rgba(142,236,152,0.8)",
        "rgba(0,48,0,0.8)",
      ],
      borderWidth: 2,
    },
  ];

  public chartLabels: Array<any> = [];

  public chartOptions: any = {
    responsive: true,
  };
  public chartClicked(e: any): void {}
  public chartHovered(e: any): void {}

  public chartType2: any = "bar";

  public chartDatasets2: Array<any> = [
    {
      data: [],
      label: "Cantidad",
      backgroundColor: [
        "rgba(13,56,0,1)",
        "rgba(0,133,51,1)",
        "rgba(0,204,24,1)",
        "rgba(120,240,0,1)",
        "rgba(142,236,152,1)",
        "rgba(0,48,0,1)",
      ],
      borderColor: [
        "rgba(13,56,0,1)",
        "rgba(13,56,0,1)",
        "rgba(13,56,0,1)",
        "rgba(13,56,0,1)",
        "rgba(13,56,0,1)",
        "rgba(13,56,0,1)",
      ],
      borderWidth: 2,
    },
  ];

  public chartLabels2: Array<any> = [];

  public chartOptions2: any = {
    responsive: true,
    indexAxis: "y",
  };
  public chartClicked2(e: any): void {}
  public chartHovered2(e: any): void {}
}
