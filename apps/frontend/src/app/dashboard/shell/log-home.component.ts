import { Component, OnInit, HostListener, inject } from "@angular/core";
import { MatIconButton } from "@angular/material/button";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatDrawerContainer, MatDrawer } from "@angular/material/sidenav";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { DialogIdle } from "@app/shared/modals/dialog-idle.component";
import { createGrupo, createUsuarioFull } from "@app/shared/models/factories";
import type { Grupo } from "@app/shared/models/grupo";
import type { UsuarioFull } from "@app/shared/models/usuarioFull";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { GLOBAL } from "@app/shared/services/global";
import { GrupoService } from "@app/shared/services/grupo.service";
import { PermisoService } from "@app/shared/services/permiso.service";
import { SessionService } from "@app/shared/services/session.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { UsuarioHasPermisoService } from "@app/shared/services/usuariohaspermiso.service";

@Component({
  selector: "app-log-home",
  templateUrl: "./log-home.component.html",
  styleUrls: ["./log-home.component.scss"],
  imports: [
    MatDrawerContainer,
    MatDrawer,
    RouterLink,
    RouterLinkActive,
    MatIconButton,
    MatIcon,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    RouterOutlet,
  ],
})
export default class LogHomeComponent implements OnInit {
  _authService = inject(AuthService);
  _usuarioService = inject(UsuarioService);
  _permisoService = inject(PermisoService);
  _usuarioHasPermisoService = inject(UsuarioHasPermisoService);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private router = inject(Router);
  private _commonService = inject(CommonService);
  private _grupoService = inject(GrupoService);
  private _session = inject(SessionService);
  private titleService = inject(Title);

  token: string | null = null;
  user: UsuarioFull;
  screenWidth: number;
  public url: string;
  public grupoinfo: Grupo;
  permisos = {
    noticiaPermiso: false,
    miembroPermiso: false,
    proyectoPermiso: false,
    publicacionPermiso: false,
    contenidoPermiso: false,
    analiticaPermiso: false,
  };

  title = "Dashboard";
  permisoUsuario: { permiso_idPermiso?: number }[] = [];

  constructor() {
    this.screenWidth = window.innerWidth;
    this.enterAny = this.screenWidth < 960;
    this.url = GLOBAL.url;
    this.user = createUsuarioFull();
    this.grupoinfo = createGrupo();
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: UIEvent): void {
    this.screenWidth = window.innerWidth;
    this.enterAny = this.screenWidth < 960;
  }

  language: { locale?: string } | null = null;

  ngOnInit(): void {
    this.titleService.setTitle("GMCAN | Administrador");
    this.getGrupoInfo();
  }

  noticiaPublicada = false;

  ngAfterViewChecked(): void {
    const titleDash = document.getElementById("titleDash");
    if (titleDash) {
      titleDash.innerHTML = this._commonService.defineTitle(window.location.pathname);
    }
    if (
      this._commonService.defineTitle(window.location.pathname) ==
      '<span>Noticias </span><span class="grey-title">- Detalle de Noticia</span>'
    ) {
      this.noticiaPublicada = this._session.noticiaPublicada();
    } else {
      this.noticiaPublicada = false;
    }
    if (this._commonService.getReset()) {
      this.getUser();
      this._commonService.setReset(false);
    }
  }

  getGrupoInfo(): void {
    this.grupoinfo = this._session.getGrupoInfo();
    this._grupoService.getGrupoInfo().subscribe((res: Grupo[]) => {
      this.grupoinfo = res[0];
      this._session.setGrupoInfo(this.grupoinfo);
      this.grupoinfo.logoHeader = this.url + "grupo/get-image-grupo/" + (this.grupoinfo.logoHeader ?? "");
      this.getUser();
    });
    this.grupoinfo.logoHeader = this.url + "grupo/get-image-grupo/" + (this.grupoinfo.logoHeader ?? "");
  }

  getUser(): void {
    const user = this._usuarioService.getUserLogged();
    if (user == null) {
      this.logout();
    } else {
      this._usuarioService.getFullUser(user.DNI).subscribe((result: UsuarioFull[]) => {
        if (result.length > 0) {
          this.user = result[0];
          if (this.user.apellidoMaterno) {
            this.user.nombreCompleto =
              (this.user.nombre ?? "") + " " + (this.user.apellidoPaterno ?? "") + " " + this.user.apellidoMaterno;
          } else {
            this.user.nombreCompleto = (this.user.nombre ?? "") + " " + (this.user.apellidoPaterno ?? "");
          }
          if ((this.user.nombre ?? "").includes(" ")) {
            const parts = (this.user.nombre ?? "").split(" ");
            this.user.nombre = parts[0];
          }
        }
        if (this.user.DNI) {
          this.getPermisoHasUsuario(this.user.DNI);
        }
      });
    }
  }

  getPermisoHasUsuario(DNI: string): void {
    this._usuarioHasPermisoService.getUsuarioHasPermiso(DNI).subscribe((res: { permiso_idPermiso?: number }[]) => {
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

  logout(): void {
    this._session.beginSessionEnd();
    this._authService.logout().subscribe(() => {
      this._router.navigate(["/login"]);
    });
  }

  backToTop(): void {
    this._session.beginSessionEnd();
    this._authService.logout().subscribe(() => {
      this._router.navigate(["/"]);
    });
  }

  enterAny: boolean;
  enterAnyway(): void {
    this.enterAny = false;
  }

  textChange(text: string): void {
    this.title = text;
  }

  private dialogRef?: MatDialogRef<DialogIdle>;

  openDialogLogOff(): void {
    this.dialogRef = this.dialog.open(DialogIdle, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "¿Estás seguro de que deseas cerrar la sesión?",
        text: "Los cambios sin guardar se perderán.",
        cancel: "Sí, cerrar sesión",
        yes: "No, cancelar",
      },
    });

    this.dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.logout();
      }
    });
  }
}
