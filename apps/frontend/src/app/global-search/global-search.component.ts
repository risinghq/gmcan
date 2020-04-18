import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { SearchService } from '../services/search.service';
import { Proyecto } from '../models/proyecto';
import { Publicacion } from '../models/publicacion';
import { UsuarioFull } from '../models/usuarioFull';
import { Noticia } from '../models/noticia';
import { PublicacionHasUsuarioService } from '../services/publicacionhasusuario.service';
import { PublicacionHasAutorService } from '../services/publicacionhasautor.service';
import { UsuarioHasProyectoService } from '../services/usuariohasproyecto';
import { UsuarioService } from '../services/usuario.service';
import { AutorService } from '../services/autor.service';
import { RevistaService } from '../services/revista.service';
import { UniversidadService } from '../services/universidad.service';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { LineasInvestigacionService } from '../services/lineasinvestigacion.service';
import { ProyectoService } from '../services/proyecto.service';
import { TipoNoticiaService } from '../services/tiponoticia.service';
import { NoticiaService } from '../services/noticia.service';
import { CiudadService } from '../services/ciudad.service';
import { PaisService } from '../services/pais.service';
import { EventoService } from '../services/evento.service';
import { TipoTesisService } from '../services/tipotesis.service';
import { PublicacionService } from '../services/publicacion.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TipoPublicacionService } from '../services/tipopublicacion.service';
import { TipoPublicacion } from '../models/tipopublicacion';
import { GLOBAL } from '../services/global';
import { Location } from '@angular/common';
import { TipoNoticia } from '../models/tiponoticia';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss']
})
export class GlobalSearchComponent implements OnInit {

  proyectos: Array<Proyecto>;
  publicaciones: Array<Publicacion>;
  miembros: Array<UsuarioFull>;
  noticias: Array<Noticia>;
  tipoPublicaciones: Array<TipoPublicacion>;
  tiponoticias: Array<TipoNoticia>;
  language;
  public searchGlobalForm:FormGroup;
  page1=1;
  pageSize=5;
  page2=1;
  public url;

  constructor(
    public titlecasePipe:TitleCasePipe,
    public datePipe: DatePipe,
    public _route: ActivatedRoute,
    public _router: Router,
    public _searchService: SearchService,
    public _publicacionhasusuarioService: PublicacionHasUsuarioService,
    public _publicacionhasautorService: PublicacionHasAutorService,
    public _proyectohasusuarioService: UsuarioHasProyectoService,
    public _usuarioService: UsuarioService,
    public _autorService: AutorService,
    public _revistaService: RevistaService,
    public _universidadService: UniversidadService,
    public _lineasInvestigacionServices:LineasInvestigacionService,
    public _proyectoServices: ProyectoService,
    public _tiponoticiaService: TipoNoticiaService,
    public _noticiaService: NoticiaService,
    public _ciudadService: CiudadService,
    public _paisService: PaisService,
    public _eventoService: EventoService,
    public _tipotesisService: TipoTesisService,
    public _publicacionesService: PublicacionService,
    public _tipoPublicacionService: TipoPublicacionService,
    public fb:FormBuilder, 
    public location: Location,
  ) {
    this.searchGlobalForm = this.fb.group({
      nombre: ['']
    });
    this.url=GLOBAL.url;
   }

  ngOnInit() {
    this.language=JSON.parse(localStorage.getItem("language"));
    this.findGlobal();
  }

  /* globalSearch */

  searchGlobal(value){
    this._router.navigate(['/search/'+value]);
    this.ngOnInit();
  }
  findGlobal(){
    this.publicaciones=[];
    this.proyectos=[];
    this.noticias=[];
    this.miembros=[];
    this.tipoPublicaciones=[];
    this.getTipoPublicacion(); 
    this.getTipoNoticias();
  }
  
  getTipoPublicacion(){
    this._tipoPublicacionService.getTipoPublicaciones().subscribe((res)=>{
      if(res){
        this.tipoPublicaciones=res;
      }
      this._route.params.forEach((params:Params)=>{
        let nombre = params['id'];
        this.searchGlobalForm.controls.nombre.setValue(nombre);
        this.searchProyectos(nombre);
      });   
    });
  }

  searchProyectos(nombre){
    this._searchService.searchProyectosGlobal(nombre).subscribe((res)=>{
      if(res){
        this.proyectos=res;
        for (let index = 0; index < this.proyectos.length; index++) {
          this.fillProyecto(this.proyectos[index],index);
        }
      }
      this.searchLineasInvestigacion(nombre);
      this.searchUsuarios(nombre);
    });
  }

  searchLineasInvestigacion(nombre){
    this._searchService.searchLineasInvestigacion(nombre).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getProyectoLinea(res[index].idLineasInvestigacion);
        }
      }
    });
  }

  searchUsuarios(nombre){
    this._searchService.searchUsuariosGlobal(nombre).subscribe((res)=>{
      if(res.length>0){
        this.miembros=res;
        for (let index = 0; index < this.miembros.length; index++) {
          this.getUsuariosHasProyecto(this.miembros[index]);
          this.getUsuarioHasPublicacion(this.miembros[index]);
          this.getUsuarioHasNoticia(this.miembros[index]);
        }
      }
      this.searchNoticias(nombre);
    });
  }

  searchNoticias(nombre){
    this._searchService.searchNoticiasGlobal(nombre).subscribe((res)=>{
      if(res.length>0){
        this.noticias=res;
        for (let index = 0; index < this.noticias.length; index++) {
          this.fillNoticia(this.noticias[index]);
        }
      }
      this.searchTipoNoticia(nombre);
    });
  }

  searchTipoNoticia(nombre){
    this._searchService.searchTipoNoticiasGlobal(nombre).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getNoticiasTipo(res[index].idtipoNoticia); 
        }        
      }
      this.searchPublicaciones(nombre);
    });
  }

  searchPublicaciones(nombre){
    this._searchService.searchPublicacionesGlobal(nombre).subscribe((res)=>{
      if(res.length>0){
        this.publicaciones=res;
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index]);
        }
      }
      this.searchAutores(nombre);
    });
  }

  searchAutores(nombre){
    this._searchService.searchAutores(nombre).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getAutorHasPublicacion(res[index].idAutor);
        }
      }
      this.searchCiudades(nombre);
    });
  }

  searchCiudades(nombre){
    this._searchService.searchCiudades(nombre).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getPublicacionCiudad(res[index].idCiudad);
        }
      }
      this.searchPaises(nombre);
    });
  }

  searchPaises(nombre){
    this._searchService.searchPaises(nombre).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getCiudades(res[index].idPais);
        }
      }
      this.searchEventos(nombre);
    });
  }

  searchEventos(nombre){
    this._searchService.searchEventos(nombre).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getPublicacionEvento(res[index].idEvento);
        }
      }
      this.searchRevista(nombre);
    });
  }

  searchRevista(nombre){
    this._searchService.searchRevista(nombre).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getPublicacionRevista(res[index].idRevista);
        }
      }
    });
  }

  /* Get Publicacion */

  getPublicacionHasUsuario(publicacion){
    this._publicacionhasusuarioService.getPublicacionHasUsuario(publicacion.idPublicacion).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getUsuario(res[index].usuario_DNI, publicacion);
        }
      }
    });
  }

  getUsuarioHasPublicacion(obj){
    this._publicacionhasusuarioService.searchPublicacionHasUsuario(obj.DNI).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getPublicacion(res[index].publicacion_idPublicacion);
        }
      }
    });
  }

  getPublicacionHasAutor(publicacion){
    this._publicacionhasautorService.getPublicacionHasAutor(publicacion.idPublicacion).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getAutor(res[index].autores_idAutor, publicacion);
        }
      }
    });
  }

  getAutorHasPublicacion(id){
    this._publicacionhasautorService.searchPublicacionHasAutor(id).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getPublicacion(res[index].publicacion_idPublicacion);
        }
      }
    });
  }

  getPublicacionCiudad(idCiudad){
    this._publicacionesService.getPublicacionesCiudad(idCiudad).subscribe((res)=>{
      if(res.length>0){
        if(this.publicaciones){
          for (let index = 0; index < res.length; index++) {
            if(this.publicaciones.findIndex(x => x.idPublicacion === res[index].idPublicacion)==-1){
              this.publicaciones.push(res[index]);
            }
          }
        }else{
          this.publicaciones=res;
        }
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index]);
        }
      }
    });
  }

  getPublicacionEvento(idEvento){
    this._publicacionesService.getPublicacionesEvento(idEvento).subscribe((res)=>{
      if(res.length>0){
        if(this.publicaciones){
          for (let index = 0; index < res.length; index++) {
            if(this.publicaciones.findIndex(x => x.idPublicacion === res[index].idPublicacion)==-1){
              this.publicaciones.push(res[index]);
            }
          }
        }else{
          this.publicaciones=res;
        }
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index]);
        }
      }
    });
  }

  getPublicacionRevista(idRevista){
    this._publicacionesService.getPublicacionesRevista(idRevista).subscribe((res)=>{
      if(res.length>0){
        if(this.publicaciones){
          for (let index = 0; index < res.length; index++) {
            if(this.publicaciones.findIndex(x => x.idPublicacion === res[index].idPublicacion)==-1){
              this.publicaciones.push(res[index]);
            }
          }
        }else{
          this.publicaciones=res;
        }
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index]);
        }
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

  getCiudades(idPais){
    this._ciudadService.getCiudades(idPais).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getPublicacionCiudad(res[index].idCiudad);
        }
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

  getPublicacion(idPublicacion){
    this._publicacionesService.getPublication(idPublicacion).subscribe((res)=>{
      if(res.length>0){
        if(this.publicaciones){
          if(this.publicaciones.findIndex(x => x.idPublicacion === res[0].idPublicacion)==-1){
            this.publicaciones.push(res[0]);
          }
        }else{
          this.publicaciones=res;
        }
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index]);
        }
      }
    });
  }

  /* Fill Publicacion */

  fillPublicacion(publicacion){
    publicacion.usuario=[];
    publicacion.autor=[];
    publicacion.fecha=this.datePipe.transform(publicacion.fechaPublicacion,"MMMM y", "es");
    publicacion.fecha=this.titlecasePipe.transform(publicacion.fecha);
    publicacion.tipoPublicacion=this.tipoPublicaciones[this.tipoPublicaciones.findIndex(x => x.idTipoPublicacion === publicacion.tipoPublicacion_idTipoPublicacion)].nombre;
    this.getPublicacionHasAutor(publicacion);
    this.getUniversidad(publicacion);
    this.getRevista(publicacion);
    this.getPublicacionHasUsuario(publicacion);
    this.getCiudad(publicacion.ciudad_idCiudad, publicacion);
    this.getEvento(publicacion.evento_idEvento, publicacion);
    this.getTipoTesis(publicacion);
  }

  /* get Proyectos */
  getUsuariosHasProyecto(user){
    this._proyectohasusuarioService.getUsuarioHasProyecto(user.DNI).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getProyectos(res[index].proyecto_idProyecto);
        }
      }
    });
  }

  getProyectosHasUsuario(proyecto){
    this._proyectohasusuarioService.getUsuarioHasProyectos(proyecto.idProyecto).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getUsuario(res[index].usuario_DNI, proyecto);
        }
      }
    });
  }

  getLineasInvestigacion(idLinea, index){
    this._lineasInvestigacionServices.getLineaInvestigacion(idLinea).subscribe((res)=>{
      if(res.length>0){
        if(this.proyectos[index]!=undefined){
          this.proyectos[index].lineasInvestigacion=res[0].nombre
        }          
      }
    });
  }

  getProyectos(idProyecto){
    this._proyectoServices.getProyectosId(idProyecto,1).subscribe((res)=>{
      if(res.length>0){         
        for (let index = 0; index < res.length; index++) {
          if(this.proyectos.findIndex(x => x.idProyecto === res[index].idProyecto)==-1){
            this.proyectos.push(res[index]);
          } 
        }
        for (let index = 0; index < this.proyectos.length; index++) {
          this.fillProyecto(this.proyectos[index], index);
        }
      }
    });
  }

  getProyectoLinea(idLineasInvestigacion){
    this._proyectoServices.getProyectosLinea(idLineasInvestigacion,1).subscribe((res)=>{
      if(res.length>0){ 
        for (let index = 0; index < res.length; index++) {
          if(this.proyectos.findIndex(x => x.idProyecto === res[index].idProyecto)==-1){
            this.proyectos.push(res[index]);
          } 
        }
        for (let index = 0; index < this.proyectos.length; index++) {
          this.fillProyecto(this.proyectos[index], index);
        }
      }
    });
  }

  /* Fill Proyecto */

  fillProyecto(proyecto, index){
    proyecto.fechaI=this.datePipe.transform(proyecto.fechaInicio,"MMMM, y", "es");
    proyecto.fechaI=this.titlecasePipe.transform(proyecto.fechaI);
    proyecto.usuario=[];
    if(proyecto.fechaFin){
      proyecto.fechaF=this.datePipe.transform(proyecto.fechaFin,"MMMM, y", "es");
      proyecto.fechaF=this.titlecasePipe.transform(proyecto.fechaF);
    }
    this.getLineasInvestigacion(proyecto.lineasInvestigacion_idLineasInvestigacion,index);
    this.getProyectosHasUsuario(proyecto);
  }

  /* get Noticias */

  getTipoNoticias(){
    this._tiponoticiaService.getTipoNoticia().subscribe((res)=>{
      this.tiponoticias=res;
    });
  }

  getNoticiasTipo(id){
    this._noticiaService.getNoticiaTipo(id).subscribe((res)=>{
      if(res.length>0){
        if(this.noticias){
          for (let index = 0; index < res.length; index++) {
            if(this.noticias.findIndex(x => x.idNoticia === res[index].idNoticia)==-1){
              this.noticias.push(res[index]);
            } 
          }
        }else{
          this.noticias=res;
        }
        for (let index = 0; index < this.noticias.length; index++) {
          this.fillNoticia(this.noticias[index]);
        }
      }
    });
  }

  getUsuarioHasNoticia(usuario){
    this._noticiaService.getNoticiaUsuario(usuario.DNI).subscribe((res)=>{
      if(res.length>0){
        if(this.noticias){
          for (let index = 0; index < res.length; index++) {
            if(this.noticias.findIndex(x => x.idNoticia === res[index].idNoticia)==-1){
              this.noticias.push(res[index]);
            } 
          }
        }else{
          this.noticias=res;
        }
        for (let index = 0; index < this.noticias.length; index++) {
          this.fillNoticia(this.noticias[index]);
        }
      }
    });

  }

  /* Fill Noticia */

  fillNoticia(obj){
    for (let j = 0; j < this.tiponoticias.length; j++) {
      if (obj.tipoNoticia_idtipoNoticia===this.tiponoticias[j].idtipoNoticia) {
        obj.nombreTipoNoticia=this.tiponoticias[j].nombre;
      }
    }
    obj.fechaPublicacion=this.datePipe.transform(obj.fechaPublicacion,"MMMM dd, y", "es");
    obj.fechaPublicacion=this.titlecasePipe.transform(obj.fechaPublicacion);
    this.getUsuarioNoticia(obj);
  }

  /*  Get Normal */  

  getUsuario(dni, obj){
    this._usuarioService.getUser(dni).subscribe((res)=>{
      if(res){
        if(obj.usuario.findIndex(x => x.idAutor === res[0].idAutor)==-1){
          obj.usuario.push(res[0]);
        }
        this.fillName(obj);
      }
    });
  }

  getUsuarioNoticia(obj){
    this._usuarioService.getUser(obj.autorPublicacion).subscribe((res)=>{
      if(res[0]!=undefined){        
          obj.autor=res[0].nombre+" "+res[0].apellidoPaterno;
      }
    });
  }

  getAutor(idAutor, obj){
    this._autorService.getAuthor(idAutor).subscribe((res)=>{
      if(obj!=undefined){
        if(obj.autor.findIndex(x => x.idAutor === res[0].idAutor)==-1){
            obj.autor.push(res[0]);
        }
        this.fillAuthName(obj);
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

  getUniversidad(publicacion){
    this._universidadService.getUniversidad(publicacion.universidad_idUniversidad).subscribe((res)=>{
      if(res && res[0]!=undefined){
        publicacion.universidad=res[0].nombre;
      }
    });
  }


  /* Fill Name */

  fillName(obj){
    for(let index = 0; index < obj.usuario.length; index++){
      if(obj.autor!=undefined){
        if(index==obj.usuario.length-1 && obj.autor.length===0){
          obj.usuario[index].nombreCompleto=obj.usuario[index].nombre+ " " +obj.usuario[index].apellidoPaterno;
        }else{
          obj.usuario[index].nombreCompleto=obj.usuario[index].nombre+ " " +obj.usuario[index].apellidoPaterno+",";
        }
      }else{
        if(index==obj.usuario.length-1){
          obj.usuario[index].nombreCompleto=obj.usuario[index].nombre+ " " +obj.usuario[index].apellidoPaterno;
        }else{
          obj.usuario[index].nombreCompleto=obj.usuario[index].nombre+ " " +obj.usuario[index].apellidoPaterno+",";
        }
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

  /* Hovers Publicaciones */

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

  scroll() {
    let el= document.getElementById("main-toolbar");
    el.scrollIntoView({ behavior: "smooth"});
  }

  profile(user){
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(['/detail-member/'+user.DNI]);
  }

  publicationExpanded=true;
  projectExpanded=true;
  memberExpanded=true;
  newsExpanded=true;

  toggleRotation(caso){
    switch (caso) {
      case 1:
        this.publicationExpanded=!this.publicationExpanded;
        break;
      case 2:
        this.projectExpanded=!this.projectExpanded;
        break;
      case 3:
        this.memberExpanded=!this.memberExpanded;
        break;
      case 4:
        this.newsExpanded=!this.newsExpanded;
        break;        
      default:
        break;
    }
  }
}
