import { Component, OnInit, Input, HostListener } from '@angular/core';
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
import { TitleCasePipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../services/search.service';
import { UsuarioHasProyectoService } from '../services/usuariohasproyecto';
import { RevistaService } from '../services/revista.service';
import { UniversidadService } from '../services/universidad.service';
import { LineasInvestigacionService } from '../services/lineasinvestigacion.service';
import { ProyectoService } from '../services/proyecto.service';
import { TipoNoticiaService } from '../services/tiponoticia.service';
import { EventoService } from '../services/evento.service';
import { TipoTesisService } from '../services/tipotesis.service';
import { TipoPublicacionService } from '../services/tipopublicacion.service';
import { FormBuilder } from '@angular/forms';
import { TipoPublicacion } from '../models/tipopublicacion';
import { TipoNoticia } from '../models/tiponoticia';
import { Proyecto } from '../models/proyecto';
import { lineasInvestigacion } from '../models/lineaInvestigacion';
import { MethodsService } from '../services/methods.service';
import { Method } from '../models/method';
import { AboutUsService } from '../services/aboutus.service';
import { GLOBAL } from '../services/global';
import { Location } from '@angular/common';
import { FuenteFinanciamientoService } from '../services/fuentefinanciamiento.service';
import { MonedaService } from '../services/moneda.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public info:Grupo;
  public publicaciones:Array<Publicacion>;
  proyectos: Array<Proyecto>;
  public autores: Array<Autor>;
  public usuarios: Array<Usuario>;
  public noticias: Array<Noticia>;
  public noticiaPrincipal: Noticia;
  public tipoPublicaciones: Array<TipoPublicacion>;
  public tiponoticias: Array<TipoNoticia>;
  public lineasInvestigacion: Array<lineasInvestigacion>;
  public metodos: Array<Method>;
  screenWidth: number;
  url;
  constructor(
    public _grupoService:GrupoService,
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
    public _eventoService: EventoService,
    public _tipotesisService: TipoTesisService,
    public _publicacionesService: PublicacionService,
    public _tipoPublicacionService: TipoPublicacionService,
    public fb:FormBuilder, 
    public _methodsService: MethodsService,
    public aboutusService: AboutUsService,
    public location: Location,
    public _fuenteFinanciamientoService: FuenteFinanciamientoService,
    public _monedaService: MonedaService,
    ) { 
      this.info = new Grupo(null,'','','','','','','','','','','','','','',null,null)
      this.noticiaPrincipal = new Noticia(null,'','','','',0,'',null,null,'','',null,'',null);
      this.publicaciones=[];
      this.autores=[];
      this.noticias=[];
      this.proyectos=[];
      this.tiponoticias=[];
      this.usuarios=[];
      this.screenWidth = window.innerWidth;
      window.onresize = () => {
        // set screenWidth on screen size change
        this.screenWidth = window.innerWidth;
      };
      this.url=GLOBAL.url;
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.screenWidth = window.innerWidth;
    }

    language;
    progress=0;
    augment=100/10;

  ngOnInit() {
    this.language=JSON.parse(localStorage.getItem("language"));
    this.getGrupoInfo();
    this.getTipoPublicacion();
    this.getProyectos();
    this.getTipoNoticias()
    this.getAllLineasInvestigacion();
    this.getMetodos();
    this.getUsuarios();
  }

  /* Get Grupo */

  getGrupoInfo(){
    this._grupoService.getGrupoInfo().subscribe((res)=>{
      this.info=res[0];
      this.progress=this.progress+this.augment;
      this.getAboutUs();
    });
  }

  getAboutUs(){
    this.aboutusService.getAboutUsInfo().subscribe((res)=>{
      this.progress=this.progress+this.augment;
      document.getElementById("services").innerHTML=res[0].servicios;
    });
  }

  /* Get Publicacion */

  getTipoPublicacion(){
    this._tipoPublicacionService.getTipoPublicaciones().subscribe((res)=>{
      if(res){
        this.tipoPublicaciones=res;
        this.progress=this.progress+this.augment;
        this.getPublicaciones();
      }
    });
  }

  resumenes=0;
  tesis=0;
  articulos=0;

  getPublicaciones(){
    this._publicacionesService.getPublicacion().subscribe((res)=>{
      if(res.length>0){
        this.progress=this.progress+this.augment;
        res.sort((a,b) => (a.fechaPublicacion < b.fechaPublicacion) ? 1 : ((b.fechaPublicacion < a.fechaPublicacion) ? -1 : 0));
        this.publicaciones=res;
        for (let index = 0; index < this.publicaciones.length; index++) {
          this.fillPublicacion(this.publicaciones[index]);
          if(this.publicaciones[index].tipoPublicacion_idTipoPublicacion===1){
            this.articulos++;
          }
          if(this.publicaciones[index].tipoPublicacion_idTipoPublicacion===2){
            this.tesis++;
          }
          if(this.publicaciones[index].tipoPublicacion_idTipoPublicacion===3){
            this.resumenes++;
          }
        }
        this.startCounter();
      }
    });
  }

  getPublicacionHasUsuario(publicacion){
    this._publicacionhasusuarioService.getPublicacionHasUsuario(publicacion.idPublicacion).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getUsuario(res[index].usuario_DNI, publicacion);
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

  getEvento(idEvento, publicacion){
    this._eventoService.getEvento(idEvento).subscribe((res)=>{
      if(res.length>0){
        publicacion.evento=res[0].nombre;
        publicacion.ciudad=res[0].ciudad;
        publicacion.pais=res[0].pais;
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
    this.getEvento(publicacion.evento_idEvento, publicacion);
    this.getTipoTesis(publicacion);
  }

  /* get Proyectos */

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
          this.proyectos[index].lineasInvestigacion=res[0].nombre;
        }          
      }
    });
  }

  getProyectos(){
    this._proyectoServices.getProyecto().subscribe((res)=>{
      if(res.length>0){
        this.proyectos=res;
        this.progress=this.progress+this.augment;
        for (let index = 0; index < this.proyectos.length; index++) {
          this.fillProyecto(this.proyectos[index], index);
        }
      }
    });
  }

  getFuenteFinanciamiento(proyecto){
    this._fuenteFinanciamientoService.getFuenteFinanciamiento(proyecto.fuenteFinanciamiento_idFuenteFinanciamiento).subscribe((res)=>{
      if(res.length>0){
        proyecto.fuenteFinanciamiento=res[0].nombre;
      }
    });
  }

  getMoneda(proyecto){
    this._monedaService.getMoneda(proyecto.moneda_idMoneda).subscribe((res)=>{
      if(res.length>0){
        proyecto.moneda=res[0].simbolo;
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
    this.getFuenteFinanciamiento(proyecto);
    this.getMoneda(proyecto);
  }

  /* get Noticias */

  getNoticias(){
    this._noticiaService.getNoticias().subscribe((res)=>{
      if(res!=null){
        this.progress=this.progress+this.augment;
        res.sort((a,b) => (a.fechaPublicacion < b.fechaPublicacion) ? 1 : ((b.fechaPublicacion < a.fechaPublicacion) ? -1 : 0));
        this.noticias=res;
        for (let index = 0; index < this.noticias.length; index++) {
          if(this.noticias[index].estado==0){
            this.noticias.splice(index,1);
          }          
        }
        for (let index = 0; index < this.noticias.length; index++) {
          this.fillNoticia(this.noticias[index]);
        }
        this.noticiaPrincipal=this.noticias[0];
        this.fillNoticia(this.noticiaPrincipal);
      }
    });
  }

  getTipoNoticias(){
    this._tiponoticiaService.getTipoNoticia().subscribe((res)=>{
      this.progress=this.progress+this.augment;
      this.tiponoticias=res;
      this.getNoticias();
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

  /* get Lineas Investigacion */

  getAllLineasInvestigacion(){
    this._lineasInvestigacionServices.getLineasInvestigacion().subscribe((res)=>{
      if(res){
        this.progress=this.progress+this.augment;
        this.lineasInvestigacion=res;
      }
    });
  }

  /* get Metodos */

  getMetodos(){
    this._methodsService.getMethods().subscribe((res)=>{
      if(res){
        this.progress=this.progress+this.augment;
        this.metodos=res;
      }
    });
  }

  /*  Get Normal */  

  getUsuario(dni, obj){
    this._usuarioService.getUser(dni).subscribe((res)=>{
      if(res){
        if(obj.usuario.findIndex(x => x.DNI === res[0].DNI)==-1){
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

  /* getUsuarios */

  getUsuarios(){
    this._usuarioService.getUsuarios().subscribe((res)=>{
      this.progress=this.progress+this.augment;
      this.usuarios=res;
      this.startCounter();
    });
  }

  publicationLink(value){
    console.log(value);
  }

  /* Animation counter */
  steps
  counterFunc(endValue, durationMs, element) {
    console.log()
    if (!this.steps) {
      this.steps = 12;
    }

    const stepCount = Math.abs(durationMs / this.steps);
    const valueIncrement = (endValue - 0) / stepCount;
    const sinValueIncrement = Math.PI / stepCount;

    let currentValue = 0;
    let currentSinValue = 0;

    function step() {
      currentSinValue += sinValueIncrement;
      currentValue += valueIncrement * Math.sin(currentSinValue) ** 2 * 2;

      element.innerText = Math.abs(Math.floor(currentValue));

      if (currentSinValue < Math.PI) {
        window.requestAnimationFrame(step);
      }
    }

    step();
  }

  startCounter(){
    if(this.usuarios.length>0 && this.resumenes>0 && this.tesis>0 && this.articulos>0){
      this.counterFunc(this.usuarios.length,1000,document.getElementById("users"));
      this.counterFunc(this.resumenes,1000,document.getElementById("resumenes"));
      this.counterFunc(this.tesis,1000,document.getElementById("tesis"));
      this.counterFunc(this.articulos,1000,document.getElementById("articulos"));
    }
  }

  navigate(route){
    this._router.navigate([route]);
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

  profile(user){
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(['/home/detail-member/'+user.DNI]);
  }

  detalleNoticia(noticia){
    this._router.navigate(['/home/detail-news/'+noticia.idNoticia]);
    this.scroll(document.getElementById("main-toolbar"));
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({ behavior: "smooth"});
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

}
