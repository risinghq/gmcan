import { Component, OnInit, ViewChild } from '@angular/core';
import { Universidad } from '../models/universidad';
import { UniversidadService } from '../services/universidad.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Publicacion } from '../models/publicacion';
import { Router } from '@angular/router';
import { PublicacionService } from '../services/publicacion.service';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { PublicacionHasUsuarioService } from '../services/publicacionhasusuario.service';
import { PublicacionHasAutorService } from '../services/publicacionhasautor.service';
import { UsuarioService } from '../services/usuario.service';
import { AutorService } from '../services/autor.service';
import { TipoTesisService } from '../services/tipotesis.service';
import { GLOBAL } from '../services/global';

@Component({
  standalone: false,
  selector: 'app-tesis',
  templateUrl: './tesis.component.html',
  styleUrls: ['./tesis.component.scss']
})
export class TesisComponent implements OnInit {

  displayedColumns: string[] = ['titulo', 'tipo', 'autores', 'universidad', 'publicacion'];
  displayedColumns2: string[] = ['nombre'];
  dataSource: MatTableDataSource<Publicacion>;
  dataSource2: MatTableDataSource<Universidad>;
  tesis: Array<Publicacion>;
  url;

  universidades: Array<Universidad>;

  constructor(
    public _router: Router,
    public _universidadService: UniversidadService,
    private _publicacionService: PublicacionService,
    public titlecasePipe:TitleCasePipe,
    public datePipe: DatePipe,
    private _publicacionhasusuarioService: PublicacionHasUsuarioService,
    private _publicacionhasautorService: PublicacionHasAutorService,
    private _usuarioService: UsuarioService,
    private _autorService: AutorService,
    private _tipoTesisService: TipoTesisService,
  ) {
    this.url=GLOBAL.url;
  }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @ViewChild(MatPaginator, {static: true}) paginator2: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort2: MatSort;

  selectedTab;

  ngOnInit() {
    this.selectedTab=sessionStorage.getItem("oldThesis");
    this.getUniversidad();
    this.getThesis();
  }

  getThesis(){
    this._publicacionService.getPublicaciones(2).subscribe((res)=>{
      if(res){
        res.sort((a,b) => (a.fechaPublicacion < b.fechaPublicacion) ? 1 : ((b.fechaPublicacion < a.fechaPublicacion) ? -1 : 0));
        this.tesis=res;
        for (let index = 0; index < this.tesis.length; index++) {
          var d = new Date(this.tesis[index].fechaPublicacion);
          d.setMinutes( d.getMinutes() + d.getTimezoneOffset());
          this.tesis[index].fecha=this.datePipe.transform(d,"MMMM, y", "es");
          this.tesis[index].fecha=this.titlecasePipe.transform(this.tesis[index].fecha);
          this.tesis[index].usuario=[];
          this.tesis[index].autor=[];
          this.getThesisUsers(this.tesis[index]);
          this.getThesisAuthors(this.tesis[index]);
          this.getTipoThesis(this.tesis[index]);
          this.getSpeUniversidad(this.tesis[index]);
        }
        this.dataSource = new MatTableDataSource(this.tesis);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  getTipoThesis(publicacion){
    this._tipoTesisService.getTipoTesis(publicacion.tipoTesis_idTipoTesis).subscribe((res)=>{
      if(res){
        publicacion.tipoTesis=res[0].nombre;
      }
    });
  }

  getThesisUsers(publicacion){
    this._publicacionhasusuarioService.getPublicacionHasUsuario(publicacion.idPublicacion).subscribe((res)=>{
      if(res){
        for (let index = 0; index < res.length; index++) {
          this.getUsuario(res[index].usuario_DNI, publicacion); 
        }
      }
    });
  }

  getSpeUniversidad(publicacion){
    this._universidadService.getUniversidad(publicacion.universidad_idUniversidad).subscribe((res)=>{
      if(res){
        publicacion.universidad=res[0].nombre;
      }
    });
  }

  getUsuario(idUser, publicacion){
    this._usuarioService.getUser(idUser).subscribe((res)=>{
      if(res[0]!=undefined){
        res[0].nombreCompleto=res[0].nombre+' '+res[0].apellidoPaterno+' '+res[0].apellidoMaterno;
        publicacion.usuario.push(res[0]);
      }
    });
  }

  getThesisAuthors(publicacion){
    this._publicacionhasautorService.getPublicacionHasAutor(publicacion.idPublicacion).subscribe((res)=>{
      if(res){
        for (let index = 0; index < res.length; index++) {
          this.getAuthor(res[index].autores_idAutor, publicacion);
        }
      }
    });
  }

  getAuthor(idAuthor, publicacion){
    this._autorService.getAuthor(idAuthor).subscribe((res)=>{
      if(res[0]!=undefined){
        publicacion.autor.push(res[0]);
      }
    });
  }

  getUniversidad(){
    this._universidadService.getUniversidades().subscribe((res)=>{
      if(res){
        this.universidades=res;
        this.dataSource2 = new MatTableDataSource(this.universidades);
        this.dataSource2.sort = this.sort2;
        this.dataSource2.paginator = this.paginator2;
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

  changedTab(event){
    sessionStorage.setItem("oldThesis", event);
  }

  addThesis(){
    localStorage.setItem('thesis-back','tesis');
    this._router.navigate(['dashboard/add-thesis']);
  }

  editThesis(id){
    localStorage.setItem('thesis-back','tesis');
    this._router.navigate(['dashboard/edit-thesis/'+id]);
  }

  addUniversidad(){
    this._router.navigate(['dashboard/add-universidad']);
  }

  editUniversidad(idUniversidad){
    this._router.navigate(['dashboard/edit-universidad/'+idUniversidad]);
  }

}
