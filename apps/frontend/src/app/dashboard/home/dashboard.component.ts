import { HttpClient } from "@angular/common/http";
import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { Grupo } from "@app/shared/models/grupo";
import { AuthService } from "@app/shared/services/auth.service";
import { GLOBAL } from "@app/shared/services/global";
import { PermisoService } from "@app/shared/services/permiso.service";
import { SessionService } from "@app/shared/services/session.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { UsuarioHasPermisoService } from "@app/shared/services/usuariohaspermiso.service";
import { BaseChartDirective } from "ng2-charts";

interface CountTypeItem {
  nombre?: string;
  Total?: string;
}

interface UsuarioPermisoItem {
  permiso_idPermiso?: number;
}

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
  imports: [RouterLink, RouterLinkActive, BaseChartDirective],
})
export default class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  _usuarioService = inject(UsuarioService);
  _permisoService = inject(PermisoService);
  _usuarioHasPermisoService = inject(UsuarioHasPermisoService);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  private http = inject(HttpClient);
  private _session = inject(SessionService);

  token: string | null = null;
  user: any = null;
  screenWidth = window.innerWidth;
  public url;
  public grupoinfo: Grupo = { idGrupo: 0, nombre: "", nombreEN: "", logoHeader: "" } as Grupo;
  permisos = {
    noticiaPermiso: false,
    miembroPermiso: false,
    proyectoPermiso: false,
    publicacionPermiso: false,
    contenidoPermiso: false,
    analiticaPermiso: false,
  };
  permisoUsuario: UsuarioPermisoItem[] = [];
  constructor() {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("user") ?? "null");
    this.getPermiso();
    this.getGrupoInfo();
    this.getCountTypeMember();
  }

  getGrupoInfo(): void {
    this.grupoinfo = this._session.getGrupoInfo();
    this.grupoinfo.logoHeader = this.url + "grupo/get-image-grupo/" + this.grupoinfo.logoHeader;
  }

  getPermiso(): void {
    this._permisoService.getPermisos().subscribe((res: unknown[]) => {
      if (res.length > 0) {
        this.getPermisoHasUsuario(String(this.user?.DNI ?? ""));
      }
    });
  }

  getPermisoHasUsuario(DNI: string): void {
    this._usuarioHasPermisoService.getUsuarioHasPermiso(DNI).subscribe((res: UsuarioPermisoItem[]) => {
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

  getCountTypeMember(): void {
    this.http.get<CountTypeItem[]>(`${GLOBAL.url}tipo-miembro/get-count-type`).subscribe((res) => {
      if (res.length > 0) {
        const filler: string[] = [];
        const filler2: string[] = [];
        for (let index = 0; index < res.length; index++) {
          filler2.push(res[index].nombre ?? "");
          filler.push(res[index].Total ?? "0");
          this.total = this.total + parseInt(res[index].Total ?? "0", 10);
        }
        this.chartLabels = filler2;
        this.chartDatasets = [{ data: filler, label: "My First dataset" }];
      }
      this.getCountTypePublication();
    });
  }

  getCountTypePublication(): void {
    this.http.get<CountTypeItem[]>(`${GLOBAL.url}tipo-publicacion/get-count-type`).subscribe((res) => {
      if (res.length > 0) {
        const filler3: string[] = [];
        const filler4: string[] = [];
        for (let index = 0; index < res.length; index++) {
          filler4.push(res[index].nombre ?? "");
          filler3.push(res[index].Total ?? "0");
          this.total2 = this.total2 + parseInt(res[index].Total ?? "0", 10);
        }
        filler3.push("0");
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

  public chartLabels: string[] = [];

  public chartOptions: any = {
    responsive: true,
  };
  public chartClicked(_e: any): void {}
  public chartHovered(_e: any): void {}

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

  public chartLabels2: string[] = [];

  public chartOptions2: any = {
    responsive: true,
    indexAxis: "y",
  };
  public chartClicked2(_e: any): void {}
  public chartHovered2(_e: any): void {}
}
