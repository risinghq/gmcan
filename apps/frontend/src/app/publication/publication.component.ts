import { Component, OnInit } from '@angular/core';
import { PreviousPageService } from '../services/previouspage.service';
import { Router, ActivatedRoute, Params} from '@angular/router';
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
import { TitleCasePipe } from '@angular/common';
import { UniversidadService } from '../services/universidad.service';
import { SearchService } from '../services/search.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import { GLOBAL } from '../services/global';

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
  private searchForm:FormGroup;
  private publicacionSearch: Array<Publicacion>;
  private tipoPublicacion;
  private url;
  constructor(
    private fb:FormBuilder,
    private titlecasePipe:TitleCasePipe,
    private datePipe: DatePipe,
    private _previousService: PreviousPageService,
    private _tipoPublicacionService: TipoPublicacionService,
    private _publicacionService: PublicacionService,
    private _revistaService: RevistaService,
    private _autorService: AutorService,
    private _publicacionhasautorService: PublicacionHasAutorService,
    private _publicacionhasusuarioService: PublicacionHasUsuarioService,
    private _usuarioService: UsuarioService,
    private _universidadService: UniversidadService,
    private _searchService: SearchService,
    private location: Location,
    private _route: ActivatedRoute,
    private _router: Router,
  ) { 
    this.tipoPublicaciones=[];
    this.autores=[];
    this.usuarios=[];
    this.searchForm = this.fb.group({
      titulo: ['']
    });
    this.url=GLOBAL.url;
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

  scroll() {
    let el= document.getElementById("main-toolbar");
    el.scrollIntoView({ behavior: "smooth"});
  }

  getTipoPublicacion(){
    this._tipoPublicacionService.getTipoPublicaciones().subscribe((res)=>{
      if(res){
        this.tipoPublicaciones=res;
        this.tipoPublicaciones[0].nombreTab="Artículos";
        this.tipoPublicaciones[1].nombreTab="Tesis";
        this.getPublicaciones(this.tipoPublicaciones[0].idTipoPublicacion);
        this.cargado=true;
      }
    });
  }
  getPublicaciones(idTipoPublicacion){
    this._publicacionService.getPublicaciones(idTipoPublicacion).subscribe((res)=>{
      if(res){
        this.allCharged=true;
        this.page = 1;
        this.pageSize =5;
        this.publicaciones=res;
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index],index);
        }
      }
    });
  }

  getRevista(publicacion){
    this._revistaService.getRevista(publicacion.revista_idRevista).subscribe((res)=>{
      if(res){
        if(res[0]!=undefined){
          publicacion.revista=res[0].nombre;
        }
      }
    });
  }

  getUsuario(idUser, i){
    this._usuarioService.getUser(idUser).subscribe((res)=>{
      if(res[0]!=undefined){
        res[0].nombre=res[0].nombre.slice(0,1)+".";
        if(this.publicaciones[i].usuario.findIndex(x => x.DNI === res[0].DNI)==-1){
          this.publicaciones[i].usuario.push(res[0]);
        }
        this.fillName(this.publicaciones[i]);
      }
    });
  }

  getAutores(idAutor, i){
    this._autorService.getAuthor(idAutor).subscribe((res)=>{
      if(this.publicaciones[i].autor.findIndex(x => x.idAutor === res[0].idAutor)==-1){
          this.publicaciones[i].autor.push(res[0]);
      }
      this.fillAuthName(this.publicaciones[i]);
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

  getUniversidad(publicacion){
    this._universidadService.getUniversidad(publicacion.universidad_idUniversidad).subscribe((res)=>{
      if(res && res[0]!=undefined){
        publicacion.universidad=res[0].nombre;
      }
    });
  }
  getPublicacion(idPublicacion){
    this._publicacionService.getPublication(idPublicacion).subscribe((res)=>{
      if(res.length>0){
        if(this.publicacionSearch){
          for (let index = 0; index < res.length; index++) {
            if(this.publicacionSearch.findIndex(x => x.idPublicacion === res[index].idPublicacion)==-1){
              this.publicacionSearch.push(res[index]);
            }
          }
        }else{
          this.publicacionSearch=res;
        }
      }
      for (let index = 0; index < this.publicacionSearch.length; index++) {
        if(this.publicacionSearch[index].tipoPublicacion_idTipoPublicacion!=this.tipoPublicacion){
          this.publicacionSearch.splice(index,1);
        }
      }
      this.publicaciones=this.publicacionSearch;
      for (let index = 0; index < this.publicaciones.length; index++) {
        this.fillPublicacion(this.publicaciones[index],index);
      }
    });
  }

  fillPublicacion(publicacion, index){
      publicacion.usuario=[];
      publicacion.autor=[];
      publicacion.fecha=this.datePipe.transform(publicacion.fechaPublicacion,"MMMM y", "es");
      publicacion.fecha=this.titlecasePipe.transform(publicacion.fecha);
      this.getUniversidad(publicacion);
      this.getRevista(publicacion);
      this.getPublicacionHasAutor(publicacion.idPublicacion, index);
      this.getPublicacionHasUsuario(publicacion.idPublicacion, index);
  }

  fillName(obj){
    for(let index = 0; index < obj.usuario.length; index++){
      if(index==obj.usuario.length-1 && obj.autor.length===0){
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
    this.searchForm.controls.titulo.setValue("");
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

  /*  Búsqueda */
  search(value, id){
    this.publicaciones=[];
    this.allCharged=false;
    this.searchPublicaciones(value,id);
    this.allCharged=true;
  }

  searchPublicaciones(titulo,id){
    this.tipoPublicacion=id;
    this._searchService.searchPublicaciones(titulo,id).subscribe((res)=>{
      this.publicacionSearch=[];
      if(res.length>0){
        this.publicacionSearch=res;
      }
      this.searchAutores(titulo);
    });
  }
  searchAutores(nombre){
    this._searchService.searchAutores(nombre).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.searchPublicacionHasAutor(res[index].idAutor);
        }
      }
      this.searchUsuarios(nombre, res);
    });
  }
  searchUsuarios(nombre, autor){
    this._searchService.searchUsuarios(nombre).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.searchPublicacionHasUsuario(res[index].DNI);
        }
      }else if(res.length==0 && autor.length==0){
        this.publicaciones=this.publicacionSearch;
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index],index);
        }
      }      
    });
  }

  searchPublicacionHasUsuario(DNI){
    this._publicacionhasusuarioService.searchPublicacionHasUsuario(DNI).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getPublicacion(res[index].publicacion_idPublicacion);
        }
      }
    });
  }
  searchPublicacionHasAutor(id){
    this._publicacionhasautorService.searchPublicacionHasAutor(id).subscribe((res)=>{
      for (let index = 0; index < res.length; index++) {
        this.getPublicacion(res[index].publicacion_idPublicacion);
      }
    });
  }
  /* Fin de busqueda */

  profile(user){
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(['/detail-member/'+user.DNI]);
  }

}
