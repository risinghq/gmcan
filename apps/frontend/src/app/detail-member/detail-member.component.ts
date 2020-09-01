import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioFull } from '../models/usuarioFull';
import { PublicacionHasUsuarioService } from '../services/publicacionhasusuario.service';
import { PublicacionService } from '../services/publicacion.service';
import { Publicacion } from '../models/publicacion';
import { DatePipe } from '@angular/common';
import { TitleCasePipe } from '@angular/common';
import { RevistaService } from '../services/revista.service';
import { AutorService } from '../services/autor.service';
import { PublicacionHasAutorService } from '../services/publicacionhasautor.service';
import { UniversidadService } from '../services/universidad.service';
import { PreviousPageService } from '../services/previouspage.service';
import { PrefijoService } from '../services/prefijo.service';
import { TipoMiembroService } from '../services/tipomiembro.service';
import { TipoPublicacionService } from '../services/tipopublicacion.service';
import { TipoPublicacion } from '../models/tipopublicacion';
import { timeout } from 'rxjs/operators';
import { GLOBAL } from '../services/global';
import { EventoService } from '../services/evento.service';
import { Location } from '@angular/common';
import { TipoTesisService } from '../services/tipotesis.service';

@Component({
  selector: 'app-detail-member',
  templateUrl: './detail-member.component.html',
  styleUrls: ['./detail-member.component.scss']
})
export class DetailMemberComponent implements OnInit {
  public usuario: UsuarioFull;
  public publicaciones: Array<Publicacion>;
  public tipoPublicaciones: Array<TipoPublicacion>;
  public cargado;
  public previouspage;
  public previouslink;
  public url;
  page;
  pageSize;
  constructor(
    public _route: ActivatedRoute,
    public _router: Router,
    public titlecasePipe:TitleCasePipe,
    public datePipe: DatePipe,
    public _usuarioService: UsuarioService,
    public _publicacionhasusuarioService: PublicacionHasUsuarioService,
    public _publicacionService: PublicacionService,
    public _revistaService: RevistaService,
    public _autorService: AutorService,
    public _publicacionhasautorService: PublicacionHasAutorService,
    public _universidadService: UniversidadService,
    public _previousService: PreviousPageService,
    public _prefijoService: PrefijoService,
    public _tipoMiembroService: TipoMiembroService,
    public _tipoPublicacionService: TipoPublicacionService,
    public _tipotesisService: TipoTesisService,
    public _eventoService: EventoService,
    public location: Location,
  ) { 
    this.url=GLOBAL.url;
    this.usuario=new UsuarioFull('','','','','','','','','',0,'','','',null,null,'',null,null,null,'',3,'',null);
  }

  language;

  ngOnInit() {
    this.language=JSON.parse(localStorage.getItem("language"));
    this.getTipoPublicacion();
    this.previouslink=sessionStorage.getItem("previous-page");
    this.previouspage=this._previousService.getPreviousPage(this.previouslink);
    this.page = 1;
    this.pageSize =5;
  }
  selectedItem;
  oldValue;
  listClick(event, newValue) {
    this.oldValue=this.selectedItem;
    this.selectedItem = newValue;
    document.getElementById("abstract"+newValue).innerText=this.language.detailMemberText[0].seeLess;
    if(this.selectedItem==this.oldValue){
      this.selectedItem=-1;
      document.getElementById("abstract"+this.oldValue).innerText=this.language.detailMemberText[0].seeMore;
    }
  }

  scroll() {
    let el= document.getElementById("main-toolbar");
    el.scrollIntoView({behavior:"smooth"});
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

  searchUsuario(){
    this.publicaciones=[];
    this._route.params.forEach((params:Params)=>{
      let DNI = params['id'];
      this._usuarioService.getUser(DNI).subscribe((res)=>{
        if(res){
          this.usuario=res[0];
          if (this.usuario.estado===1) {
            this.usuario.active=this.language.detailMemberText[0].activeMember;
          }else{
            this.usuario.active=this.language.detailMemberText[0].oldMember;
          }
          this.usuario.foto=this.url+'usuario/get-image-usuario/'+this.usuario.foto;
          this.searchPublicacionHasUsuario(this.usuario.DNI);
          this.getPrefijos();
          this.getTipoMiembros();
        }
      });
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

  getTipoPublicacion(){
    this._tipoPublicacionService.getTipoPublicaciones().subscribe((res)=>{
      this.tipoPublicaciones=[];
      if(res){
        this.tipoPublicaciones=res;
        this.searchUsuario();
      }
      this.cargado=true;
    });
  }

  getPublicacion(idPublicacion){
    this._publicacionService.getPublication(idPublicacion).subscribe((res)=>{
      if(res.length>0){
        this.publicaciones.sort((a,b) => (a.fechaPublicacion < b.fechaPublicacion) ? 1 : ((b.fechaPublicacion < a.fechaPublicacion) ? -1 : 0));
        for (let index = 0; index < res.length; index++) {
          if(this.publicaciones.findIndex(x => x.idPublicacion === res[index].idPublicacion)===-1){
            this.publicaciones.push(res[index]);
          }
        }
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index],index);
        }
        this.cargado=true;
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
    publicacion.fecha=this.datePipe.transform(publicacion.fechaPublicacion,"MMMM y");
    publicacion.fecha=this.titlecasePipe.transform(publicacion.fecha);
    for (let index = 0; index < this.tipoPublicaciones.length; index++) {
      if (publicacion.tipoPublicacion_idTipoPublicacion===this.tipoPublicaciones[index].idTipoPublicacion) {
        publicacion.tipoPublicacion=this.tipoPublicaciones[index].nombre
      }
    }
    this.getUniversidad(publicacion);
    this.getRevista(publicacion);
    this.getPublicacionHasAutor(publicacion.idPublicacion, index);
    this.getPublicacionHasUsuario(publicacion.idPublicacion, index);    
    this.getEvento(publicacion.evento_idEvento, publicacion);
    this.getTipoTesis(publicacion);
  }

  getEvento(idEvento, publicacion){
    this._eventoService.getEvento(idEvento).subscribe((res)=>{
      if(res.length>0){
        publicacion.evento=res[0].nombre;
        publicacion.ciudad=res[0].ciudad;
        publicacion.pais=res[0].pais;
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

  getPublicacionHasAutor(idPublicacion, i){
    this._publicacionhasautorService.getPublicacionHasAutor(idPublicacion).subscribe((res)=>{
      for (let index = 0; index < res.length; index++) {
        this.getAutores(res[index].autores_idAutor, i);
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

  return(){
    this._router.navigate([this.previouslink]);
  }

  getAutores(idAutor, i){
    this._autorService.getAuthor(idAutor).subscribe((res)=>{
      if(this.publicaciones[i].autor.findIndex(x => x.idAutor === res[0].idAutor)==-1){
          this.publicaciones[i].autor.push(res[0]);
      }
      this.fillAuthName(this.publicaciones[i]);
    });
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

  getPrefijos(){
    this._prefijoService.getPrefijos().subscribe((res)=>{
      if(res){
        for (let j = 0; j < res.length; j++) {
          if(this.usuario.Prefijo_idPrefijo==res[j].idPrefijo){
            this.usuario.prefijo=res[j].nombre;
          }
        }
      }
    });
  }

  getTipoMiembros(){
    this._tipoMiembroService.getTipoMiembros().subscribe((res)=>{
      if(res){
        for (let index = 0; index < res.length; index++) {
          if(this.usuario.tipoMiembro_idTipoMiembro===res[index].idTipoMiembro){
            this.usuario.tipoMiembro=res[index].nombreSingular;
          }
        }
      }
    });
  }

  profile(user){
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(['/home/detail-member/'+user.DNI]);
    this.getTipoPublicacion();
  }

}
