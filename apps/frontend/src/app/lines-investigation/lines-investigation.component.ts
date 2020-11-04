import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { LineasInvestigacionService } from '../services/lineasinvestigacion.service';
import { lineasInvestigacion } from '../models/lineaInvestigacion';
import { ProyectoService } from '../services/proyecto.service';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { UsuarioHasProyectoService } from '../services/usuariohasproyecto';
import { UsuarioService } from '../services/usuario.service';
import { Location } from '@angular/common';
import { GLOBAL } from '../services/global';
import { FuenteFinanciamientoService } from '../services/fuentefinanciamiento.service';
import { MonedaService } from '../services/moneda.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-lines-investigation',
  templateUrl: './lines-investigation.component.html',
  styleUrls: ['./lines-investigation.component.scss']
})
export class LinesInvestigationComponent implements OnInit {

  language;

  public lineasProyecto: Array<lineasInvestigacion>;
  public page0;
  public pageSize;
  public page1;
  public pageSize2;
  public page2;
  public pageSize3;
  public url;
  constructor(
    private _lineasInvestigacionServices: LineasInvestigacionService,
    private _proyectoServices: ProyectoService,
    private _usuarioHasProyectoService: UsuarioHasProyectoService,
    private _usuarioService: UsuarioService,
    public titlecasePipe:TitleCasePipe,
    public datePipe: DatePipe,
    public location: Location,
    public _route: ActivatedRoute,
    public _router: Router,
    public _fuenteFinanciamientoService: FuenteFinanciamientoService,
    public _monedaService: MonedaService,
    private titleService: Title,
  ) { 
    this.lineasProyecto=[];
    this.lineasProyecto[0]=new lineasInvestigacion(null,'','',null,'','',null,null,null,[],0);
    this.lineasProyecto[1]=new lineasInvestigacion(null,'','',null,'','',null,null,null,[],0);
    this.lineasProyecto[2]=new lineasInvestigacion(null,'','',null,'','',null,null,null,[],0);
  }

  ngOnInit() {
    this.url=GLOBAL.url;
    this.language=JSON.parse(localStorage.getItem("language"));
    this.titleService.setTitle('GMCAN | '+this.language.linesInvestigation);
    this.getLineasInvestigacion();
    this.page0 = 1;
    this.pageSize = 5;
    this.page1 = 1;
    this.pageSize2 = 5;
    this.page2 = 1;
    this.pageSize3 = 5;
  }

  selectedItem;
  oldValue;

  listClick(event, newValue) {
    this.oldValue=this.selectedItem;
    this.selectedItem = newValue;
    document.getElementById("abstract"+newValue).innerText=this.language.linesInvestigationText[0].seeLess;
    if(this.selectedItem==this.oldValue){
      this.selectedItem=-1;
      document.getElementById("abstract"+this.oldValue).innerText=this.language.linesInvestigationText[0].seeMore;
    }
  }

  getLineasInvestigacion(){
    this._lineasInvestigacionServices.getLineasInvestigacion().subscribe((res)=>{
      this.lineasProyecto=res;
      for (let index = 0; index < this.lineasProyecto.length; index++) {
        this.lineasProyecto[index].proyectos=[];
        this.getProyectosLineas(this.lineasProyecto[index]);
      }
    });
  }

  getProyectosLineas(lineaProyecto){
    this._proyectoServices.getProyectosLinea(lineaProyecto.idLineasInvestigacion, 1).subscribe((res)=>{
      lineaProyecto.proyectos=res;
      for (let index = 0; index < lineaProyecto.proyectos.length; index++) {
        this.fillProyecto(lineaProyecto.proyectos[index]);
      }
    });
  }

  fillProyecto(proyecto){
    proyecto.fechaI=this.datePipe.transform(proyecto.fechaInicio,"MMMM, y", "es");
    proyecto.fechaI=this.titlecasePipe.transform(proyecto.fechaI);
    for (let index = 0; index < this.lineasProyecto.length; index++) {
      if(proyecto.lineasInvestigacion_idLineasInvestigacion===this.lineasProyecto[index].idLineasInvestigacion){
        proyecto.lineasInvestigacion=this.lineasProyecto[index].nombre;
      }
    }
    proyecto.usuario=[];
    if(proyecto.fechaFin){
      proyecto.fechaF=this.datePipe.transform(proyecto.fechaFin,"MMMM, y", "es");
      proyecto.fechaF=this.titlecasePipe.transform(proyecto.fechaF);
    }
    this.getUsuarioHasProyecto(proyecto);
    this.getFuenteFinanciamiento(proyecto)
    this.getMoneda(proyecto)
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
    this._router.navigate(['/home/detail-member/'+user.DNI]);
  }

}
