import { Component, OnInit, Input } from '@angular/core';
import { GrupoService } from '../services/grupo.service';
import { PublicacionService } from '../services/publicacion.service';
import { Grupo } from '../models/grupo';
import { Publicacion } from '../models/publicacion';
import { AutorService } from '../services/autor.service';
import { Autor } from '../models/autores';
import { PublicacionHasAutorService } from '../services/publicacionhasautor.service';
import { PublicacionHasUsuarioService } from '../services/publicacionhasusuario.service';
import { Usuario } from '../models/usuario';
import { UsuarioService } from '../services/usuario.service';
import { Noticia } from '../models/noticia';
import { NoticiaService } from '../services/noticia.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private info:Grupo;
  private publicaciones:Array<Publicacion>;
  private autores: Array<Autor>;
  private usuarios: Array<Usuario>;
  private noticias: Array<Noticia>;
  private noticiaPrincipal: Noticia;
  constructor(
    private datePipe: DatePipe,
    private _grupoService: GrupoService,
    private _publicacionService: PublicacionService,
    private _autorService: AutorService,
    private _publicacionhasautorService: PublicacionHasAutorService,
    private _publicacionhasusuarioService: PublicacionHasUsuarioService,
    private _usuarioService: UsuarioService,
    private _noticiaService: NoticiaService,
    ) { 
      this.info = new Grupo(null,'','','','','','','','','',null,null)
      this.noticiaPrincipal = new Noticia(null,'','','','',null,null,'','')
      this.publicaciones=[];
      this.autores=[];
      this.noticias=[];
    }

  ngOnInit() {
    this.getGrupoInfo();
    this.getAutores();
    this.getPublicacion();
    this.getUsuario();
    this.getNoticia();
  }

  getGrupoInfo(){
    this._grupoService.getGrupoInfo().subscribe((res)=>{
      this.info=res[0];
    });
  }

  getPublicacion(){
    this._publicacionService.getPublicacion().subscribe((res)=>{
      this.publicaciones=res;
      for (let index = 0; index < this.publicaciones.length; index++) {
        this.publicaciones[index].autores="";
        this.getPublicacionHasAutor(this.publicaciones[index].idPublicacion,index);
        this.getPublicacionHasUsuario(this.publicaciones[index].idPublicacion,index);
      }
    });
  }

  getUsuario(){
    this._usuarioService.getUsuario().subscribe((res)=>{
      this.usuarios=res;
    });
  }

  getAutores(){
    this._autorService.getAutor().subscribe((res)=>{
      this.autores=res;
    });
  }
  
  getPublicacionHasAutor(idPublicacion, ind){
    this._publicacionhasautorService.getPublicacionHasAutor(idPublicacion).subscribe((res)=>{
      for (let index = 0; index < res.length; index++) {
        for (let j = 0; j < this.autores.length; j++) {
          this.filtAutor(this.autores[j],res[index],ind);
        }
      }
    });
  }

  getPublicacionHasUsuario(idPublicacion, ind){
    this._publicacionhasusuarioService.getPublicacionHasUsuario(idPublicacion).subscribe((res)=>{
      for (let index = 0; index < res.length; index++) {
        for (let j = 0; j < this.usuarios.length; j++) {
          this.filtAutor(this.usuarios[j],res[index],ind);
        }
      }
    });
  }

  filtAutor(array, res, ind){
    if(array.DNI===res.usuario_DNI){
      if(res.isPrincipal===1){
        if(this.publicaciones[ind].autores===""){
          this.publicaciones[ind].autores=array.nombre;
        }else{
          this.publicaciones[ind].autores=array.nombre+", "+this.publicaciones[ind].autores;
        }
      }else{
        if(this.publicaciones[ind].autores===""){
          this.publicaciones[ind].autores=array.nombre;
        }else{
          this.publicaciones[ind].autores=array.nombre+", "+this.publicaciones[ind].autores;
        }
      }
    }
  }

  getNoticia(){
    this._noticiaService.getNoticia().subscribe((res)=>{
      if(res!=null){
        res.sort((a,b) => (a.prioridad > b.prioridad) ? 1 : ((b.prioridad > a.prioridad) ? -1 : 0));
        this.noticias=res;
        for (let index = 0; index < this.noticias.length; index++) {
          this.noticias[index].fechaPublicacion=this.datePipe.transform(this.noticias[index].fechaPublicacion,"MMM dd");
        }
        this.noticiaPrincipal=this.noticias[0];
        this.noticias.splice(0,1);
      }
    });
  }

}
