import { Component, OnInit, ViewChild } from '@angular/core';
import { Proyecto } from '../models/proyecto';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Router } from '@angular/router';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { FuenteFinanciamientoService } from '../services/fuentefinanciamiento.service';
import { FuenteFinanciamiento } from '../models/fuentefinanciamiento';
import { ProyectoService } from '../services/proyecto.service';
import { UsuarioHasProyectoService } from '../services/usuariohasproyecto';
import { UsuarioService } from '../services/usuario.service';
import { GLOBAL } from '../services/global';

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.component.html',
  styleUrls: ['./proyectos.component.scss']
})
export class ProyectosComponent implements OnInit {

  displayedColumns: string[] = ['titulo', 'primerAutor', 'fechaInicio', 'codigo'];
  displayedColumns2: string[] = ['nombre'];
  dataSource: MatTableDataSource<Proyecto>;
  dataSource2: MatTableDataSource<FuenteFinanciamiento>;
  fuenteFinanciamientos: Array<FuenteFinanciamiento>;
  proyectos: Array<Proyecto>
  url;
  selectedTab;

  constructor(
    public _router: Router,
    public titlecasePipe:TitleCasePipe,
    public datePipe: DatePipe,
    public _fuenteFinanciamientoService:FuenteFinanciamientoService,
    public _proyectoService:ProyectoService,
    public _proyectohasusuarioService: UsuarioHasProyectoService,
    public _usuarioService:UsuarioService,
  ) {
    this.url=GLOBAL.url;
  }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @ViewChild(MatPaginator, {static: true}) paginator2: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort2: MatSort;

  ejecucion

  ngOnInit() {
    this.selectedTab=sessionStorage.getItem("oldProject");
    if(window.location.href.includes('ejecucion')){
      this.ejecucion=true;
      this.getFuenteFinanciamiento();
      this.getProyectos(1);
    }else{
      this.getProyectos(0);
    }
  }

  getFuenteFinanciamiento(){
    this._fuenteFinanciamientoService.getFuenteFinanciamientos().subscribe((res)=>{
      if(res){
        res.sort((a,b) => (a.nombre < b.nombre) ? 1 : ((b.nombre < a.nombre) ? -1 : 0));
        this.fuenteFinanciamientos=res;
        this.dataSource2 = new MatTableDataSource(this.fuenteFinanciamientos);
        this.dataSource2.sort = this.sort;
        this.dataSource2.paginator = this.paginator;
      }
    });
  }

  getProyectos(value){
    this._proyectoService.getProyectos(value).subscribe((res)=>{
      if(res){
        res.sort((a,b) => (a.titulo < b.titulo) ? 1 : ((b.titulo < a.titulo) ? -1 : 0));
        this.proyectos=res;
        this.dataSource = new MatTableDataSource(this.proyectos);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        for (let index = 0; index < this.proyectos.length; index++) {
          this.fillProyecto(this.proyectos[index])
        }
      }
    });
  }

  fillProyecto(proyecto){
    proyecto.fechaI=this.datePipe.transform(proyecto.fechaInicio,"MMMM, y", "es");
    proyecto.fechaI=this.titlecasePipe.transform(proyecto.fechaI);
    proyecto.usuario=[];
    this.getProyectoUsuarios(proyecto);
  }

  getProyectoUsuarios(proyecto){
    this._proyectohasusuarioService.getUsuarioHasProyectos(proyecto.idProyecto).subscribe((res)=>{
      if(res.length>0){
        for (let index = 0; index < res.length; index++) {
          this.getUsuario(proyecto, res[index].usuario_DNI);
        }
      }
    });
  }

  getUsuario(proyecto, DNI){
    this._usuarioService.getUser(DNI).subscribe((res)=>{
      if(res){
        proyecto.usuario.push(res[0]);
        proyecto.usuario[proyecto.usuario.length-1].nombreCompleto=proyecto.usuario[proyecto.usuario.length-1].nombre+' '+proyecto.usuario[proyecto.usuario.length-1].apellidoPaterno+' '+proyecto.usuario[proyecto.usuario.length-1].apellidoMaterno;
      }
    });
  }

  displayedNotFound;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    if(this.dataSource.filteredData.length==0){
      this.displayedNotFound=true;
    }else{
      this.displayedNotFound=false;
    }
  }

  displayedNotFound2;

  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
    if(this.dataSource2.filteredData.length==0){
      this.displayedNotFound2=true;
    }else{
      this.displayedNotFound2=false
    }
  }

  displayedNotFound3;

  applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
    if(this.dataSource2.filteredData.length==0){
      this.displayedNotFound2=true;
    }else{
      this.displayedNotFound2=false
    }
  }

  changedTab(event){
    sessionStorage.setItem("oldProject", event);
  }

  addProject(){
    this._router.navigate(['dashboard/add-project']);
  }

  editProject(id){
    this._router.navigate(['dashboard/edit-project/'+id]);
  }


  addFuente(){
    this._router.navigate(['dashboard/add-fuente']);
  }

  editFuente(id){
    this._router.navigate(['dashboard/edit-fuente/'+id]);
  }

}