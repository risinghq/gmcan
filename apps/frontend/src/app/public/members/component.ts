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
import { LookupService } from "@app/shared/services/lookup.service";
import { SessionService } from "@app/shared/services/session.service";
import { UsuarioService } from "@app/shared/services/usuario.service";

@Component({
  selector: "app-members",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [MatIcon, MatTabGroup, MatTab, MatProgressSpinner, NewsComponent],
})
export default class MembersComponent implements OnInit {
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _usuarioService = inject(UsuarioService);
  lookup = inject(LookupService);
  private _session = inject(SessionService);
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
    this.language = this._session.language();
    this.titleService.setTitle("GMCAN | " + this.language.members);
    this.cargado = true;
    this.tipoMiembros = this.lookup.tiposMiembro().map((t) => Object.assign({}, t, { miembros: [] as UsuarioFull[] }));
    this.getUsuarios();
  }

  getUsuarios(): void {
    this._usuarioService.getUsuarios().subscribe((res: UsuarioFull[]) => {
      if (res) {
        this.usuarios = res;
        const prefijos = this.lookup.prefijos();
        for (const usuario of this.usuarios) {
          if (usuario.foto != null) {
            usuario.foto = this.url + "usuario/" + usuario.DNI + "/file";
          } else {
            usuario.foto = "../../assets/img/user.png";
          }
          const prefijo = prefijos.find(
            (p) => p.idPrefijo === usuario.prefijo_idPrefijo && p.nombre !== "Ninguno" && p.nombre !== "Bachiller",
          );
          if (prefijo) usuario.prefijo = prefijo.nombre;
        }
        this.allCharged = true;
        for (const tipoMiembro of this.tipoMiembros) {
          tipoMiembro.miembros = this.usuarios.filter(
            (u) => u.tipoMiembro_idTipoMiembro === tipoMiembro.idTipoMiembro && u.estado === 1,
          );
        }
        this.usuariosNoActivos = this.usuarios.filter((u) => u.estado !== 1);
      }
    });
  }

  profile(user: UsuarioFull): void {
    this._router.navigate(["/home/detail-member/" + user.DNI]);
  }
}
