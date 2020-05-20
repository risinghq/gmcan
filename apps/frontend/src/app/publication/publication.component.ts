import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
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
import { CiudadService } from '../services/ciudad.service';
import { PaisService } from '../services/pais.service';
import { EventoService } from '../services/evento.service';
import { identifierModuleUrl } from '@angular/compiler';
import { TipoTesisService } from '../services/tipotesis.service';

@Component({
  selector: 'app-publication',
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.scss']
})
export class PublicationComponent implements OnInit {
  public previouslink;
  public previouspage;
  public tipoPublicaciones: Array<TipoPublicacion>;
  public publicaciones: Array<Publicacion>;
  public autores: Array<Autor>;
  public usuarios: Array<Usuario>;
  public cargado;
  public allCharged;
  public searchForm:FormGroup;
  public publicacionSearch: Array<Publicacion>;
  public tipoPublicacion;
  public url;
  constructor(
    public fb:FormBuilder,
    public titlecasePipe:TitleCasePipe,
    public datePipe: DatePipe,
    public _previousService: PreviousPageService,
    public _tipoPublicacionService: TipoPublicacionService,
    public _publicacionService: PublicacionService,
    public _revistaService: RevistaService,
    public _autorService: AutorService,
    public _publicacionhasautorService: PublicacionHasAutorService,
    public _publicacionhasusuarioService: PublicacionHasUsuarioService,
    public _usuarioService: UsuarioService,
    public _universidadService: UniversidadService,
    public _searchService: SearchService,
    public _ciudadService: CiudadService,
    public _paisService: PaisService,
    public _eventoService: EventoService,
    public _tipotesisService: TipoTesisService,
    public location: Location,
    public _route: ActivatedRoute,
    public _router: Router,
  ) { 
    this.tipoPublicaciones=[];
    this.autores=[];
    this.usuarios=[];
    this.searchForm = this.fb.group({
      titulo: ['']
    });
    this.url=GLOBAL.url;
  }
  language;
  selectedItem;
  oldValue;
  listClick(event, newValue) {
    this.oldValue=this.selectedItem;
    this.selectedItem = newValue;
    document.getElementById("abstract"+newValue).innerText=this.language.publicationsText[0].seeLess;
    if(this.selectedItem==this.oldValue){
      this.selectedItem=-1;
      document.getElementById("abstract"+this.oldValue).innerText=this.language.publicationsText[0].seeMore;
    }
  }
  page;
  pageSize;
  ngOnInit() {
    this.language=JSON.parse(localStorage.getItem("language"));
    this.allCharged=false;
    this.previouslink=sessionStorage.getItem("previous-page");
    this.previouspage=this._previousService.getPreviousPage(this.previouslink);
    this.getTipoPublicacion();
  }
  ngDoCheck(){
    if(this.tipoPublicaciones && this.tipoPublicaciones[0]){
      this.tipoPublicaciones[0].nombreTab=this.language.publicationsText[0].nameTab1;
      this.tipoPublicaciones[1].nombreTab=this.language.publicationsText[0].nameTab2;
      this.tipoPublicaciones[2].nombreTab=this.language.publicationsText[0].nameTab3;
      this.tipoPublicaciones[0].search=this.language.publicationsText[0].search1;
      this.tipoPublicaciones[1].search=this.language.publicationsText[0].search2;
      this.tipoPublicaciones[2].search=this.language.publicationsText[0].search3;
    }
  }

  scroll() {
    let el= document.getElementById("main-toolbar");
    el.scrollIntoView({ behavior: "smooth"});
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
        if(this.publicaciones[i]!=undefined){
          if(this.publicaciones[i].usuario.findIndex(x => x.DNI === res[0].DNI)==-1){
            this.publicaciones[i].usuario.push(res[0]);
          }
          this.fillName(this.publicaciones[i]);
        }
      }
    });
  }

  getAutores(idAutor, i){
    this._autorService.getAuthor(idAutor).subscribe((res)=>{
      if(this.publicaciones[i]!=undefined){
        if(this.publicaciones[i].autor.findIndex(x => x.idAutor === res[0].idAutor)==-1){
            this.publicaciones[i].autor.push(res[0]);
        }
        this.fillAuthName(this.publicaciones[i]);
      }
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

  getCiudad(idCiudad, publicacion){
    this._ciudadService.getCiudad(idCiudad).subscribe((res)=>{
      if(res.length>0){
        publicacion.ciudad=res[0].nombre;
        this.getPais(res[0].pais_idPais,publicacion);
      }
    });
  }

  getPais(idPais, publicacion){
    this._paisService.getPais(idPais).subscribe((res)=>{
      if(res.length>0){
        publicacion.pais=res[0].nombre;
      }
    });
  }

  getEvento(idEvento, publicacion){
    this._eventoService.getEvento(idEvento).subscribe((res)=>{
      if(res.length>0){
        publicacion.evento=res[0].nombre;
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

  getTipoTesis(publicacion){
    this._tipotesisService.getTiposTesis().subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          if(publicacion.tipoTesis_idTipoTesis == res[index].idTipoTesis){
            publicacion.tipoTesis=res[index].nombre;
          }
        }
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
      this.getCiudad(publicacion.ciudad_idCiudad, publicacion);
      this.getEvento(publicacion.evento_idEvento, publicacion);
      this.getTipoTesis(publicacion);
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
    this.publicaciones=[];
    this.getPublicaciones(this.tipoPublicaciones[$event.index].idTipoPublicacion);
    this.searchForm.controls.titulo.setValue("");
  }

  /* Share Hover */
  public fbicon="../../assets/img/Facebook.svg";
  public twitter="../../assets/img/twitter.svg";
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
    if(value!=""){
      this.searchPublicaciones(value,id);
    }else{
      this.getPublicaciones(id);
    }
  }

  searchPublicaciones(titulo,id){
    this.tipoPublicacion=id;
    this._searchService.searchPublicaciones(titulo,id).subscribe((res)=>{
      this.publicacionSearch=[]
      if(res.length>0){
        this.publicacionSearch=res;
      }
      this.searchAutores(titulo);
      if(id===3){
        this.searchEventos(titulo,id);
        this.searchPaises(titulo,id);
      }
      if(id===2){
        this.searchTipoTesis(titulo, id);
      }
      this.allCharged=true;
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
  searchEventos(nombre,tipoPublicacion){
    this._publicacionService.getPublicaciones(tipoPublicacion).subscribe((res)=>{
      if(res.length>0){
        let publicacionesFound=res;
        this._searchService.searchEventos(nombre).subscribe((res)=>{
          if(res.length>0){
            for (let index = 0; index < res.length; index++) {
              let valor=publicacionesFound.findIndex(x => x.evento_idEvento === res[index].idEvento);
              if(valor!=-1){
                this.getPublicacion(publicacionesFound[valor].idPublicacion);
              }
            }
          }
        });
      }
    });
  }

  paisesEncontrados;

  searchPaises(nombre,tipoPublicacion){
    this._searchService.searchPaises(nombre).subscribe((res)=>{
      if(res.length>0){
        this.paisesEncontrados=res;
        for (let index = 0; index < this.paisesEncontrados.length; index++) {
          this.getCiudades(this.paisesEncontrados[index].idPais, tipoPublicacion);
        }
      }
      this.searchCiudades(nombre,tipoPublicacion);
    });
  }

  searchCiudades(nombre,tipoPublicacion){
    this._searchService.searchCiudades(nombre).subscribe((res)=>{
      if(res.length>0){
        let ciudades=res;
        this._publicacionService.getPublicaciones(tipoPublicacion).subscribe((res)=>{
          if(res.length>0){
            let publicacionesFound=res;
            for (let index = 0; index < ciudades.length; index++) {
              let valor=publicacionesFound.findIndex(x => x.ciudad_idCiudad === ciudades[index].idCiudad);
              if(valor!=-1){
                this.getPublicacion(publicacionesFound[valor].idPublicacion);
              }
            }
          }
        });
      }
    });
  }

  searchTipoTesis(nombre, tipoPublicacion){
    this._searchService.searchTipoTesis(nombre).subscribe((res)=>{
      if(res.length>0){
        let tipoTesis=res;
        this._publicacionService.getPublicaciones(tipoPublicacion).subscribe((res)=>{
          if(res.length>0){
            let publicacionesFound=res;
            for (let index = 0; index < publicacionesFound.length; index++) {
              for (let j = 0; j < tipoTesis.length; j++) {
                if(tipoTesis[j].idTipoTesis===publicacionesFound[index].tipoTesis_idTipoTesis){
                  this.getPublicacion(publicacionesFound[index].idPublicacion);
                }
              }
            }
          }
        });
      }
    });
  }

  getCiudades(idPais, tipoPublicacion){
    this._ciudadService.getCiudades(idPais).subscribe((res)=>{
      if(res.length>0){
        let ciudades=res;
        this._publicacionService.getPublicaciones(tipoPublicacion).subscribe((res)=>{
          if(res.length>0){
            let publicacionesFound=res;
            for (let index = 0; index < ciudades.length; index++) {
              let valor=publicacionesFound.findIndex(x => x.ciudad_idCiudad === ciudades[index].idCiudad);
              if(valor!=-1){
                this.getPublicacion(publicacionesFound[valor].idPublicacion);
              }
            }
          }
        });
      }
    });
  }

  /* Fin de busqueda */

  profile(user){
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(['/home/detail-member/'+user.DNI]);
  }

}
