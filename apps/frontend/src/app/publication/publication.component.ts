import { Component, OnInit } from '@angular/core';
import { PreviousPageService } from '../services/previouspage.service';
import { TipoPublicacionService } from '../services/tipopublicacion.service';
import { TipoPublicacion } from '../models/tipopublicacion';
import { PublicacionService } from '../services/publicacion.service';
import { Publicacion } from '../models/publicacion';
import { DatePipe } from '@angular/common';
import { RevistaService } from '../services/revista.service';
import { Autor } from '../models/autores';
import { Usuario } from '../models/usuario';
import { AutorService } from '../services/autor.service';
import { PublicacionHasAutorService } from '../services/publicacionhasautor.service';
import { PublicacionHasUsuarioService } from '../services/publicacionhasusuario.service';
import { UsuarioService } from '../services/usuario.service';

@Component({
  selector: 'app-publication',
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.scss']
})
export class PublicationComponent implements OnInit {
  private previouslink;
  private previouspage;
  private tipoPublicaciones: Array<TipoPublicacion>;
  private publicaciones: Array<Publicacion>;
  private autores: Array<Autor>;
  private usuarios: Array<Usuario>;
  private cargado;
  private allCharged;
  constructor(
    private datePipe: DatePipe,
    private _previousService: PreviousPageService,
    private _tipoPublicacionService: TipoPublicacionService,
    private _publicacionService: PublicacionService,
    private _revistaService: RevistaService,
    private _autorService: AutorService,
    private _publicacionhasautorService: PublicacionHasAutorService,
    private _publicacionhasusuarioService: PublicacionHasUsuarioService,
    private _usuarioService: UsuarioService,
  ) { 
    this.tipoPublicaciones=[];
    this.autores=[];
    this.usuarios=[];
  }
  selectedItem;
  oldValue;
  listClick(event, newValue) {
    this.oldValue=this.selectedItem;
    this.selectedItem = newValue;
    document.getElementById("abstract"+newValue).innerText="Ocultar resumen";
    if(this.selectedItem==this.oldValue){
      this.selectedItem=-1;
      document.getElementById("abstract"+this.oldValue).innerText="Ver resumen";
    }
  }
  page;
  pageSize;
  ngOnInit() {
    this.allCharged=false;
    this.previouslink=sessionStorage.getItem("previous-page");
    this.previouspage=this._previousService.getPreviousPage(this.previouslink);
    this.getTipoPublicacion();
  }

  getTipoPublicacion(){
    this._tipoPublicacionService.getTipoPublicaciones().subscribe((res)=>{
      if(res){
        this.tipoPublicaciones=res;
        this.getPublicaciones(this.tipoPublicaciones[0].idTipoPublicacion);
        this.cargado=true;
      }
    });
  }
  getPublicaciones(idTipoPublicacion){
    this._publicacionService.getPublicaciones(idTipoPublicacion).subscribe((res)=>{
      if(res){
        this.page = 1;
        this.pageSize =5;
        this.publicaciones=res;
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.publicaciones[index].usuario=[];
          this.publicaciones[index].autor=[];
          this.publicaciones[index].fecha=this.datePipe.transform(this.publicaciones[index].fechaPublicacion,"MMMM y", "es");
          this.getRevista(this.publicaciones[index]);
          this.getPublicacionHasAutor(this.publicaciones[index].idPublicacion, index);
          this.getPublicacionHasUsuario(this.publicaciones[index].idPublicacion, index);
        }
      }
    });
  }

  getRevista(publicacion){
    this._revistaService.getRevista(publicacion.revista_idRevista).subscribe((res)=>{
      if(res){
        publicacion.revista=res[0].nombre;
      }
    });
  }

  getUsuario(idUser, i){
    this._usuarioService.getUser(idUser).subscribe((res)=>{
      res[0].nombre=res[0].nombre.slice(0,1)+".";
      this.publicaciones[i].usuario.push(res[0]);
      this.fillName(this.publicaciones[i]);
      this.allCharged=true;
    });
  }

  getAutores(idAutor, i){
    this._autorService.getAuthor(idAutor).subscribe((res)=>{
      this.publicaciones[i].autor.push(res[0]);
      this.fillAuthName(this.publicaciones[i]);
      this.allCharged=true;
    });
  }
  
  getPublicacionHasAutor(idPublicacion, i){
    this._publicacionhasautorService.getPublicacionHasAutor(idPublicacion).subscribe((res)=>{
      for (let index = 0; index < res.length; index++) {
        this.getAutores(res[index].autores_idAutor, i);
      }
    });
  }

  getPublicacionHasUsuario(idPublicacion, i){
    this._publicacionhasusuarioService.getPublicacionHasUsuario(idPublicacion).subscribe((res)=>{
      for (let index = 0; index < res.length; index++) {
        this.getUsuario(res[index].usuario_DNI, i);
      }
    });
  }

  fillName(obj){
    for(let index = 0; index < obj.usuario.length; index++){
      if(index==obj.usuario.length-1 && obj.autor==undefined){
        obj.usuario[index].nombreCompleto=obj.usuario[index].nombre+ " " +obj.usuario[index].apellidoPaterno + " " + obj.usuario[index].apellidoMaterno;
      }else{
        obj.usuario[index].nombreCompleto=obj.usuario[index].nombre+ " " +obj.usuario[index].apellidoPaterno + " " + obj.usuario[index].apellidoMaterno +",";
      }
    }
  }
  fillAuthName(obj){
    for(let index = 0; index < obj.autor.length; index++){
      if(index==obj.autor.length-1){
        obj.autor[index].nombreAutor=obj.autor[index].nombre;
      }else{
        obj.autor[index].nombreAutor=obj.autor[index].nombre+",";
      }
    }
  }

  /* Request Publicaciones at Tab Change */
  changeTab($event){
    this.getPublicaciones(this.tipoPublicaciones[$event.index].idTipoPublicacion);
  }

  /* Share Hover */
  private fbicon="../../assets/img/Facebook.svg";
  private twitter="../../assets/img/twitter.svg";
  mouseEnter(int, index){
    let element: any;
    switch (int) {
      case 1:
        document.getElementById("fb"+index).setAttribute("src","../../assets/img/Facebook2.svg");
        break;
      case 2:
        document.getElementById("t"+index).setAttribute("src", "../../assets/img/twitter2.svg");
        break;
      case 3:
        document.getElementById("fbl"+index).setAttribute("src", "../../assets/img/Facebook2.svg");
        break;
      case 4:
        document.getElementById("tl"+index).setAttribute("src", "../../assets/img/twitter2.svg");
        break;
    }
  }

  mouseLeave(int, index){
    let element: any;
    switch (int) {
      case 1:
        document.getElementById("fb"+index).setAttribute("src","../../assets/img/Facebook.svg");
        break;
      case 2:
        document.getElementById("t"+index).setAttribute("src", "../../assets/img/twitter.svg");
        break;
      case 3:
        document.getElementById("fbl"+index).setAttribute("src","../../assets/img/Facebook.svg");
        break;
      case 4:
        document.getElementById("tl"+index).setAttribute("src", "../../assets/img/twitter.svg");
        break;
    }
  }

}
