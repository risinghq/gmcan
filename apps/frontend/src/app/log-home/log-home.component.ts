import { Component, OnInit } from '@angular/core';
import { Grupo } from '../models/grupo';
import { UsuarioService } from '../services/usuario.service';
import { PermisoService } from '../services/permiso.service';
import { UsuarioHasPermisoService } from '../services/usuariohaspermiso.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GLOBAL } from '../services/global';
import { UsuarioFull } from '../models/usuarioFull';

@Component({
  selector: 'app-log-home',
  templateUrl: './log-home.component.html',
  styleUrls: ['./log-home.component.scss']
})
export class LogHomeComponent implements OnInit {

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
    public _usuarioService: UsuarioService,
    public _permisoService: PermisoService,
    public _usuarioHasPermisoService: UsuarioHasPermisoService,
    public _route: ActivatedRoute,
    public _router: Router,
  ){
    this.url=GLOBAL.url;
    this.user = new UsuarioFull("","","","","","","",0,"","",null,null,null,1,"",1,"",null);
  }

  ngOnInit() {
    this.checkToken();
    this.getGrupoInfo();
  }

  getGrupoInfo(){
    this.grupoinfo=JSON.parse(localStorage.getItem("grupoInfo"));
    this.grupoinfo.logoHeader=this.url+'grupo/get-image-grupo/'+this.grupoinfo.logoHeader;
  }

  checkToken(){
    this._usuarioService.checkToken().subscribe((res)=>{
      if(res && res.state==1){
        this.user=this._usuarioService.getUserLogged();
        this.user.nombreCompleto=this.user.nombre+ " " +this.user.apellidoPaterno + " " + this.user.apellidoMaterno;
        this.getPermiso();
      }
      if(res.success==0){
        this._router.navigate(['/login']);
      }
    });
  }

  getPermiso(){
    this._permisoService.getPermisos().subscribe((res)=>{
      if(res.length>0){
        this.getPermisoHasUsuario(this.user.DNI, res);
      }
    });
  }

  getPermisoHasUsuario(DNI, permisoList){
    this._usuarioHasPermisoService.getUsuarioHasPermiso(DNI).subscribe((res)=>{
      if(res.length>0){
        this.permisoUsuario=res;
        for (let index = 0; index < permisoList.length; index++) {
          switch (permisoList[index].idPermiso) {
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

  logout(){
    this._usuarioService.logout();
    this._router.navigate(['/login'])
  }

  title="Dashboard"

  textChange(text){
    this.title=text;
  }
}
