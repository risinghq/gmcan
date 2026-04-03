import { Location, NgIf, NgFor } from "@angular/common";
import { Component, OnInit } from "@angular/core";
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
import { TipoMiembroService } from "@app/shared/services/tipomiembro.service";
import { UsuarioService } from "@app/shared/services/usuario.service";

@Component({
  selector: "app-members",
  templateUrl: "./members.component.html",
  styleUrls: ["./members.component.scss"],
  imports: [MatIcon, MatTabGroup, MatTab, NgIf, MatProgressSpinner, NgFor, NewsComponent],
})
export default class MembersComponent implements OnInit {
  public cargado;
  public usuarios: Array<UsuarioFull>;
  public usuariosNoActivos: Array<UsuarioFull>;
  public tipoMiembros: Array<TipoMiembro>;
  public url;
  language;
  constructor(
    public _route: ActivatedRoute,
    public _router: Router,
    public _usuarioService: UsuarioService,
    public _prefijoService: PrefijoService,
    public _tipoMiembroService: TipoMiembroService,
    public location: Location,
    private titleService: Title,
  ) {
    this.url = GLOBAL.url;
  }

  allCharged;

  ngOnInit() {
    this.language = JSON.parse(localStorage.getItem("language"));
    this.titleService.setTitle("GMCAN | " + this.language.members);
    this.usuariosNoActivos = [];
    this.cargado = true;
    this.getTipoMiembros();
  }

  getUsuarios(tipoMiembro) {
    this._usuarioService.getUsuarios().subscribe((res) => {
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

  getTipoMiembros() {
    this._tipoMiembroService.getTipoMiembros().subscribe((res) => {
      if (res) {
        this.tipoMiembros = res;
        for (let index = 0; index < this.tipoMiembros.length; index++) {
          this.tipoMiembros[index].miembros = [];
          this.getUsuarios(this.tipoMiembros[index]);
        }
      }
    });
  }

  getPrefijos(tipoMiembro) {
    this._prefijoService.getPrefijos().subscribe((res) => {
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
            tipoMiembro.miembros.push(this.usuarios[j]);
          } else if (
            this.usuarios[j].estado != 1 &&
            // Si el usuario tiene estado 2, es inactivo si es 3 es in memoriam
            this.usuariosNoActivos.findIndex((x) => x.DNI === this.usuarios[j].DNI) == -1
          ) {
            this.usuariosNoActivos.push(this.usuarios[j]);
          }
        }
      }
    });
  }

  profile(user) {
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(["/home/detail-member/" + user.DNI]);
  }
}
