import { Component, OnInit, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioFull } from '../models/usuarioFull';
import { PrefijoService } from '../services/prefijo.service';
import { TipoMiembroService } from '../services/tipomiembro.service';
import { TipoMiembro } from '../models/tipomiembro';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { GLOBAL } from '../services/global';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
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
  ) {
    this.url=GLOBAL.url;
  }

  ngOnInit() {
    this.language=JSON.parse(localStorage.getItem("language"));
    this.usuariosNoActivos=[];
    this.cargado=true;
    this.getTipoMiembros();
  }

  getUsuarios(tipoMiembro){
    this._usuarioService.getUsuarios().subscribe((res)=>{
      if(res){
        this.usuarios=res;
        for (let index = 0; index < this.usuarios.length; index++) {
          if(this.usuarios[index].foto!=null){
            this.usuarios[index].foto=this.url+'usuario/get-image-usuario/'+this.usuarios[index].foto;
          }else{
            this.usuarios[index].foto="../../assets/img/user.png";
          } 
        }
        this.getPrefijos(tipoMiembro);
      }
    });
  }

  getTipoMiembros(){
    this._tipoMiembroService.getTipoMiembros().subscribe((res)=>{
      if(res){
        this.tipoMiembros=res;
        for (let index = 0; index < this.tipoMiembros.length; index++) {
          this.tipoMiembros[index].miembros=[];
          this.getUsuarios(this.tipoMiembros[index]);
        }
      }
    });
  }
  
  getPrefijos(tipoMiembro){
    this._prefijoService.getPrefijos().subscribe((res)=>{
      if(res){
        for (let index = 0; index < this.usuarios.length; index++) {
          for (let j = 0; j < res.length; j++) {
            if(this.usuarios[index].Prefijo_idPrefijo==res[j].idPrefijo){
              this.usuarios[index].prefijo=res[j].nombre;
            }
          }
        }
        for (let j = 0; j < this.usuarios.length; j++) {
          if(tipoMiembro.idTipoMiembro==this.usuarios[j].tipoMiembro_idTipoMiembro && this.usuarios[j].estado===1){
            tipoMiembro.miembros.push(this.usuarios[j]);
            
          }else if(this.usuarios[j].estado!=1 && 
            // Si el usuario tiene estado 2, es inactivo si es 3 es in memoriam
            this.usuariosNoActivos.findIndex(x => x.DNI === this.usuarios[j].DNI)==-1){
            this.usuariosNoActivos.push(this.usuarios[j]);
          }
        }
      }
    });
  }

  profile(user){
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(['/detail-member/'+user.DNI]);
  }

}
