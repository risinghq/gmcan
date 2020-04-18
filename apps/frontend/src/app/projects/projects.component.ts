import { Component, OnInit, HostListener } from '@angular/core';
import { Proyecto } from '../models/proyecto';
import { ProyectoService } from '../services/proyecto.service';
import { LineasInvestigacionService } from '../services/lineasinvestigacion.service';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UsuarioHasProyectoService } from '../services/usuariohasproyecto';
import { UsuarioService } from '../services/usuario.service';
import { Location } from '@angular/common';
import { ThrowStmt } from '@angular/compiler';
import { GLOBAL } from '../services/global';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  public proyectos: Array<Proyecto>;
  public tipoProyectos: Array<String>
  allCharged;
  public searchForm:FormGroup;
  public url;

  constructor(
    public fb:FormBuilder,
    public titlecasePipe:TitleCasePipe,
    public datePipe: DatePipe,
    private _proyectoServices: ProyectoService,
    private _lineasInvestigacionServices: LineasInvestigacionService,
    private _usuarioHasProyectoService: UsuarioHasProyectoService,
    private _usuarioService: UsuarioService,
    public location: Location,
    public _route: ActivatedRoute,
    public _router: Router,
    public _searchService: SearchService,
  ) { 
    this.searchForm = this.fb.group({
      titulo: ['']
    });
    
  }
  language;
  public page;
  public pageSize;
  screenWidth;
  searchText;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenWidth = window.innerWidth;
    this.setSearchText();
  }
  ngOnInit() {
    this.language=JSON.parse(localStorage.getItem("language"));
    this.screenWidth = window.innerWidth;
    this.url=GLOBAL.url;
    this.proyectos=[];
    this.page = 1;
    this.pageSize = 5;
    this.setSearchText();
    this.getProyectos(1);
  }

  ngDoCheck(){
    if(this.tipoProyectos){
      this.tipoProyectos[0]=this.language.projectsText[0].projectsType1;
      this.tipoProyectos[1]=this.language.projectsText[0].projectsType2;
    }
  }

  setSearchText(){
    this.searchText=this.language.projectsText[0].placeholderMobile;
    if(this.screenWidth>960){
      this.searchText=this.language.projectsText[0].placeholder;
    }
  }

  /* Request Publicaciones at Tab Change */
  changeTab($event){
    let estado = 0;
    if($event.index==0){
      estado=1;
    }
    this.getProyectos(estado);
  }

  scroll() {
    let el= document.getElementById("main-toolbar");
    el.scrollIntoView({ behavior: "smooth"});
  }

  getProyectos(estado){
    this._proyectoServices.getProyectos(estado).subscribe((res)=>{
      if(res.length>0){ 
        this.tipoProyectos=[];
        this.proyectos=res;
        this.allCharged=true;
        this.tipoProyectos.push(this.language.projectsText[0].projectsType1);
        this.tipoProyectos.push(this.language.projectsText[0].projectsType2);
        for (let index = 0; index < this.proyectos.length; index++) {
          this.fillProyecto(this.proyectos[index], index);
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
  selectedItem;
  oldValue;

  listClick(event, newValue) {
    this.oldValue=this.selectedItem;
    this.selectedItem = newValue;
    document.getElementById("abstract"+newValue).innerText=this.language.projectsText[0].seeLess;
    if(this.selectedItem==this.oldValue){
      this.selectedItem=-1;
      document.getElementById("abstract"+this.oldValue).innerText=this.language.projectsText[0].seeMore;
    }
  }

  /* Fill proyecto data */

  fillProyecto(proyecto, index){
    proyecto.fechaI=this.datePipe.transform(proyecto.fechaInicio,"MMMM, y", "es");
    proyecto.fechaI=this.titlecasePipe.transform(proyecto.fechaI);
    proyecto.usuario=[];
    if(proyecto.fechaFin){
      proyecto.fechaF=this.datePipe.transform(proyecto.fechaFin,"MMMM, y", "es");
      proyecto.fechaF=this.titlecasePipe.transform(proyecto.fechaF);
    }
    this.getLineasInvestigacion(proyecto.lineasInvestigacion_idLineasInvestigacion,index);
    this.getUsuarioHasProyecto(proyecto);
  }

  getUsuarioHasProyecto(proyecto){
    this._usuarioHasProyectoService.getUsuarioHasProyectos(proyecto.idProyecto).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getUsuario(res[index].usuario_DNI, proyecto);
        }
      }
    });
  }

  getUsuario(idUsuario, proyecto){
    this._usuarioService.getUser(idUsuario).subscribe((res)=>{
      if(res){
        proyecto.usuario.push(res[0]);
        this.fillName(proyecto);
      }
    });
  }

  fillName(obj){
    for(let index = 0; index < obj.usuario.length; index++){
      if(index==obj.usuario.length-1){
        obj.usuario[index].nombreCompleto=obj.usuario[index].nombre+ " " +obj.usuario[index].apellidoPaterno;
      }else{
        obj.usuario[index].nombreCompleto=obj.usuario[index].nombre+ " " +obj.usuario[index].apellidoPaterno+",";
      }
    }
  }

  profile(user){
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(['/detail-member/'+user.DNI]);
  }

  /* Search Methods */

  getProyectoLinea(idLineaInvestigacion, estado){
    this._proyectoServices.getProyectosLinea(idLineaInvestigacion, estado).subscribe((res)=>{
      if(res.length>0){
        if(this.proyectos){
          for (let index = 0; index < res.length; index++) {
            if(this.proyectos.findIndex(x => x.idProyecto === res[index].idProyecto)==-1){
              this.proyectos.push(res[index]);
            }
          }
        }else{
          this.proyectos=res;
        }
      }
      for (let index = 0; index < this.proyectos.length; index++) {
        if(this.proyectos[index]!=undefined){
          this.fillProyecto(this.proyectos[index],index);
        }
      }
    });
  }

  getProyectoId(idProyecto, estado){
    this._proyectoServices.getProyectosId(idProyecto, estado).subscribe((res)=>{
      if(res.length>0){
        if(this.proyectos){
          for (let index = 0; index < res.length; index++) {
            if(this.proyectos.findIndex(x => x.idProyecto === res[index].idProyecto)==-1){
              this.proyectos.push(res[index]);
            }
          }
        }else{
          this.proyectos=res;
        }
      }
      for (let index = 0; index < this.proyectos.length; index++) {
        if(this.proyectos[index]!=undefined){
          this.fillProyecto(this.proyectos[index],index);
        }
      }
    });
  }

  search(nombre, index){    
    this.proyectos=[]
    let estado = 0;
    if(index==0){
      estado=1;
    }
    if(nombre!=""){
      this.searchProyectos(nombre, estado)
    }else{
      this.getProyectos(estado)
    }
  }

  searchProyectos(nombre, estado){
    this._searchService.searchProyectos(nombre, estado).subscribe((res)=>{
      if(res.length>0){
        this.proyectos=res;
        for (let index = 0; index < this.proyectos.length; index++) {
          if(this.proyectos[index]!=undefined){
            this.fillProyecto(this.proyectos[index],index);
          }
        }
      }
      this.searchLineasInvestigacion(nombre, estado);
    });
  }

  searchLineasInvestigacion(nombre, estado){
    this._searchService.searchLineasInvestigacion(nombre).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getProyectoLinea(res[index].idLineasInvestigacion, estado);
        }
      }
      this.searchResponsables(nombre, estado);
    });
  }

  searchResponsables(nombre, estado){
    this._searchService.searchUsuarios(nombre).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getUsuarioHasProyectoId(res[0].DNI, estado);
        };
      }
    });
  }

  getUsuarioHasProyectoId(DNI, estado){
    this._usuarioHasProyectoService.getUsuarioHasProyecto(DNI).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getProyectoId(res[index].proyecto_idProyecto,estado);
        };
      }
    });
  }

}
