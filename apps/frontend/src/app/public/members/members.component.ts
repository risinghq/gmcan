import { Location } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { TipoMiembro } from "@app/shared/models/tipomiembro";
import { UsuarioFull } from "@app/shared/models/usuarioFull";
import { GLOBAL } from "@app/shared/services/global";
import { PrefijoService } from "@app/shared/services/prefijo.service";
import { SessionService } from "@app/shared/services/session.service";
import { TipoMiembroService } from "@app/shared/services/tipomiembro.service";
import { UsuarioService } from "@app/shared/services/usuario.service";

@Component({
  selector: "app-members",
  templateUrl: "./members.component.html",
  styleUrl: "./members.component.scss",
  imports: [MatIcon, MatTabGroup, MatTab, MatProgressSpinner, NewsComponent],
})
export default class MembersComponent implements OnInit {
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _usuarioService = inject(UsuarioService);
  _prefijoService = inject(PrefijoService);
  _tipoMiembroService = inject(TipoMiembroService);
  private _session = inject(SessionService);
  location = inject(Location);
  private titleService = inject(Title);

  public cargado = false;
  public usuarios: UsuarioFull[] = [];
  public usuariosNoActivos: UsuarioFull[] = [];
  public tipoMiembros: TipoMiembro[] = [];
  public url: string;
  language: any = {};
  constructor() {
    this.url = GLOBAL.url;
  }

  allCharged = false;

  ngOnInit(): void {
    this.language = this._session.getLanguageData<any>() ?? {};
    this.titleService.setTitle("GMCAN | " + this.language.members);
    this.cargado = true;
    this.getTipoMiembros();
  }

  getUsuarios(tipoMiembro: TipoMiembro): void {
    this._usuarioService.getUsuarios().subscribe((res: UsuarioFull[]) => {
      if (res) {
        this.usuarios = res;
        for (let index = 0; index < this.usuarios.length; index++) {
          if (this.usuarios[index].foto != null) {
            this.usuarios[index].foto = this.url + "usuario/get-image-usuario/" + this.usuarios[index].foto;
          } else {
            this.usuarios[index].foto = "../../assets/img/user.png";
          }
        }
        this.getPrefijos(tipoMiembro);
      }
    });
  }

  getTipoMiembros(): void {
    this._tipoMiembroService.getTipoMiembros().subscribe((res: TipoMiembro[]) => {
      if (res) {
        this.tipoMiembros = res;
        for (let index = 0; index < this.tipoMiembros.length; index++) {
          this.tipoMiembros[index].miembros = [];
          this.getUsuarios(this.tipoMiembros[index]);
        }
      }
    });
  }

  getPrefijos(tipoMiembro: TipoMiembro): void {
    this._prefijoService.getPrefijos().subscribe((res: any[]) => {
      if (res) {
        this.allCharged = true;
        for (let index = 0; index < this.usuarios.length; index++) {
          for (let j = 0; j < res.length; j++) {
            if (
              this.usuarios[index].prefijo_idPrefijo == res[j].idPrefijo &&
              res[j].nombre != "Ninguno" &&
              res[j].nombre != "Bachiller"
            ) {
              this.usuarios[index].prefijo = res[j].nombre;
            }
          }
        }
        for (let j = 0; j < this.usuarios.length; j++) {
          if (
            tipoMiembro.idTipoMiembro == this.usuarios[j].tipoMiembro_idTipoMiembro &&
            this.usuarios[j].estado === 1
          ) {
            tipoMiembro.miembros ??= [];
            tipoMiembro.miembros.push(this.usuarios[j]);
          } else if (
            this.usuarios[j].estado != 1 &&
            // Si el usuario tiene estado 2, es inactivo si es 3 es in memoriam
            this.usuariosNoActivos.findIndex((x: UsuarioFull) => x.DNI === this.usuarios[j].DNI) == -1
          ) {
            this.usuariosNoActivos.push(this.usuarios[j]);
          }
        }
      }
    });
  }

  profile(user: UsuarioFull): void {
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(["/home/detail-member/" + user.DNI]);
  }
}
