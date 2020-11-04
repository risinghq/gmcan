import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { PermisoService } from '../services/permiso.service';
import { UsuarioHasPermisoService } from '../services/usuariohaspermiso.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Grupo } from '../models/grupo';
import { GLOBAL } from '../services/global';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  token;
  user;
  screenWidth;
  public  url;
  public  grupoinfo:Grupo;
  permisos={
    noticiaPermiso: false,
    miembroPermiso:false,
    proyectoPermiso:false,
    publicacionPermiso:false,
    contenidoPermiso:false,
    analiticaPermiso:false,
  };
  permisoUsuario;
  constructor(
    public authService: AuthService,
    public _usuarioService: UsuarioService,
    public _permisoService: PermisoService,
    public _usuarioHasPermisoService: UsuarioHasPermisoService,
    public _route: ActivatedRoute,
    public _router: Router,
  ){
    this.url=GLOBAL.url;
  }

  ngOnInit() {
    this.user=JSON.parse(localStorage.getItem("user"));
    this.getPermiso();
    this.getGrupoInfo();
  }

  getGrupoInfo(){
    this.grupoinfo=JSON.parse(localStorage.getItem("grupoInfo"));
    this.grupoinfo.logoHeader=this.url+'grupo/get-image-grupo/'+this.grupoinfo.logoHeader;
  }

  getPermiso(){
    this._permisoService.getPermisos().subscribe((res)=>{
      if(res.length>0){
        this.getPermisoHasUsuario(this.user.DNI);
      }
    });
  }

  getPermisoHasUsuario(DNI){
    this._usuarioHasPermisoService.getUsuarioHasPermiso(DNI).subscribe((res)=>{
      if(res.length>0){
        this.permisoUsuario=res;
        for (let index = 0; index < this.permisoUsuario.length; index++) {
          switch (this.permisoUsuario[index].permiso_idPermiso) {
            case 1:
              this.permisos.noticiaPermiso=true;
              break;
            case 2:
              this.permisos.proyectoPermiso=true;
              break;
            case 3:
              this.permisos.publicacionPermiso=true;
              break;
            case 4:
              this.permisos.miembroPermiso=true;
              break;
            case 5:
              this.permisos.contenidoPermiso=true;
              break;
            case 6:
              this.permisos.analiticaPermiso=true;
              break;
            default:
              break;
          } 
        }
      }
    });
  }
}
