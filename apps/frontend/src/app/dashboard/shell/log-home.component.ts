import { NgIf } from "@angular/common";
import { Component, OnInit, HostListener } from "@angular/core";
import { MatIconButton } from "@angular/material/button";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatDrawerContainer, MatDrawer } from "@angular/material/sidenav";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { DialogIdle } from "@app/shared/modals/dialog-idle.component";
import { Grupo } from "@app/shared/models/grupo";
import { UsuarioFull } from "@app/shared/models/usuarioFull";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { GLOBAL } from "@app/shared/services/global";
import { GrupoService } from "@app/shared/services/grupo.service";
import { PermisoService } from "@app/shared/services/permiso.service";
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
    NgIf,
    MatIconButton,
    MatIcon,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    RouterOutlet,
    DialogIdle,
  ],
})
export default class LogHomeComponent implements OnInit {
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

  title = "Dashboard";
  permisoUsuario;

  constructor(
    public _authService: AuthService,
    public _usuarioService: UsuarioService,
    public _permisoService: PermisoService,
    public _usuarioHasPermisoService: UsuarioHasPermisoService,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private router: Router,
    private _commonService: CommonService,
    private _grupoService: GrupoService,
    private titleService: Title,
  ) {
    this.screenWidth = window.innerWidth;
    this.enterAny = this.screenWidth < 960;
    this.url = GLOBAL.url;
    this.user = new UsuarioFull(
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      0,
      "",
      "",
      "",
      null,
      null,
      "",
      null,
      null,
      null,
      "",
      3,
      "",
      null,
    );
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.screenWidth = window.innerWidth;
    this.enterAny = this.screenWidth < 960;
  }

  language;

  ngOnInit() {
    this.titleService.setTitle("GMCAN | Administrador");
    this.getGrupoInfo();
  }

  noticiaPublicada;

  ngAfterViewChecked() {
    document.getElementById("titleDash").innerHTML = this._commonService.defineTitle(window.location.pathname);
    if (
      this._commonService.defineTitle(window.location.pathname) ==
      '<span>Noticias </span><span class="grey-title">- Detalle de Noticia</span>'
    ) {
      if (JSON.parse(sessionStorage.getItem("noticiaPublicada")) == 1) {
        this.noticiaPublicada = true;
      } else {
        this.noticiaPublicada = false;
      }
    } else {
      this.noticiaPublicada = false;
    }
    if (this._commonService.getReset()) {
      this.getUser();
      this._commonService.setReset(false);
    }
  }

  getGrupoInfo() {
    this.grupoinfo = JSON.parse(localStorage.getItem("grupoInfo"));
    this._grupoService.getGrupoInfo().subscribe((res) => {
      this.grupoinfo = res[0];
      localStorage.setItem("grupoInfo", JSON.stringify(this.grupoinfo));
      this.grupoinfo.logoHeader = this.url + "grupo/get-image-grupo/" + this.grupoinfo.logoHeader;
      this.getUser();
    });
    this.grupoinfo.logoHeader = this.url + "grupo/get-image-grupo/" + this.grupoinfo.logoHeader;
  }

  getUser() {
    const user = this._usuarioService.getUserLogged();
    if (user == null) {
      this.logout();
    } else {
      this._usuarioService.getFullUser(user.DNI).subscribe((result) => {
        if (result.length > 0) {
          this.user = result[0];
          if (this.user.apellidoMaterno) {
            this.user.nombreCompleto =
              this.user.nombre + " " + this.user.apellidoPaterno + " " + this.user.apellidoMaterno;
          } else {
            this.user.nombreCompleto = this.user.nombre + " " + this.user.apellidoPaterno;
          }
          if (this.user.nombre.includes(" ")) {
            const parts = this.user.nombre.split(" ");
            this.user.nombre = parts[0];
          }
        }
        this.getPermisoHasUsuario(this.user.DNI);
      });
    }
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

  logout() {
    localStorage.setItem("sessionEnd", "1");
    this._authService.logout().subscribe(() => {
      this._router.navigate(["/login"]);
    });
  }

  backToTop() {
    localStorage.setItem("sessionEnd", "1");
    this._authService.logout().subscribe(() => {
      this._router.navigate(["/"]);
    });
  }

  enterAny;
  enterAnyway() {
    this.enterAny = false;
  }

  textChange(text) {
    this.title = text;
  }

  private dialogRef: MatDialogRef<DialogIdle>;

  openDialogLogOff() {
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

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.logout();
      }
    });
  }
}
