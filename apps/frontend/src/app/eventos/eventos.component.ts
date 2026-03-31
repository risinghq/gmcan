import { Component, OnInit, ViewChild } from '@angular/core';
import { EventoService } from '../services/evento.service';
import { Evento } from '../models/eventos';
import { Publicacion } from '../models/publicacion';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { PublicacionService } from '../services/publicacion.service';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { PublicacionHasUsuarioService } from '../services/publicacionhasusuario.service';
import { PublicacionHasAutorService } from '../services/publicacionhasautor.service';
import { UsuarioService } from '../services/usuario.service';
import { AutorService } from '../services/autor.service';
import { GLOBAL } from '../services/global';

@Component({
  standalone: false,
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.scss']
})
export class EventosComponent implements OnInit {

  eventos: Array<Evento>
  resumenes: Array<Publicacion>;
  url;

  displayedColumns: string[] = ['titulo', 'primerAutor', 'presentacion', 'evento'];
  displayedColumns2: string[] = ['nombre', 'pais', 'ciudad'];
  dataSource: MatTableDataSource<Publicacion>;
  dataSource2: MatTableDataSource<Evento>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @ViewChild(MatPaginator, {static: true}) paginator2: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort2: MatSort;
  selectedTab;

  constructor(
    public _eventosService: EventoService,
    public _router: Router,
    private _publicacionService: PublicacionService,
    public titlecasePipe:TitleCasePipe,
    public datePipe: DatePipe,
    private _publicacionhasusuarioService: PublicacionHasUsuarioService,
    private _publicacionhasautorService: PublicacionHasAutorService,
    private _usuarioService: UsuarioService,
    private _autorService: AutorService,
  ) {
    this.url=GLOBAL.url;
  }

  ngOnInit() {
    this.selectedTab=sessionStorage.getItem("oldResumen");
    this.getEventos();
    this.getResumenes();
  }

  getResumenes(){
    this._publicacionService.getPublicaciones(3).subscribe((res)=>{
      if(res){
        res.sort((a,b) => (a.fechaPublicacion < b.fechaPublicacion) ? 1 : ((b.fechaPublicacion < a.fechaPublicacion) ? -1 : 0));
        this.resumenes=res;
        for (let index = 0; index < this.resumenes.length; index++) {
          var d = new Date(this.resumenes[index].fechaPublicacion);
          d.setMinutes( d.getMinutes() + d.getTimezoneOffset());
          this.resumenes[index].fecha=this.datePipe.transform(d,"MMMM, y", "es");
          this.resumenes[index].fecha=this.titlecasePipe.transform(this.resumenes[index].fecha);
          this.resumenes[index].usuario=[];
          this.resumenes[index].autor=[];
          this.getArticlesUsers(this.resumenes[index]);
          this.getArticlesAuthors(this.resumenes[index]);
          this.getSpeEvento(this.resumenes[index]);
        }
        this.dataSource = new MatTableDataSource(this.resumenes);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  getSpeEvento(publicacion){
    this._eventosService.getEvento(publicacion.evento_idEvento).subscribe((res)=>{
      if(res[0]){
        publicacion.evento=res[0].nombre;
      }
    });
  }

  getArticlesUsers(publicacion){
    this._publicacionhasusuarioService.getPublicacionHasUsuario(publicacion.idPublicacion).subscribe((res)=>{
      if(res){
        let indexPrincipal = res.findIndex(x => x.isPrincipal == 0);
        if(indexPrincipal!=-1){
          this.getUsuario(res[indexPrincipal].usuario_DNI, publicacion);
        }
      }
    });
  }

  getUsuario(idUser, publicacion){
    this._usuarioService.getUser(idUser).subscribe((res)=>{
      if(res[0]!=undefined){
        publicacion.usuario.push(res[0]);
        publicacion.usuario[0].nombreCompleto=publicacion.usuario[0].nombre+' '+publicacion.usuario[0].apellidoPaterno+' '+publicacion.usuario[0].apellidoMaterno;
      }
    });
  }

  getArticlesAuthors(publicacion){
    this._publicacionhasautorService.getPublicacionHasAutor(publicacion.idPublicacion).subscribe((res)=>{
      if(res){
        let indexPrincipal = res.findIndex(x => x.isPrincipal == 0);
        if(indexPrincipal!=-1){
          this.getAuthor(res[indexPrincipal].autores_idAutor, publicacion);
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

  getEventos(){
    this._eventosService.getEventoesAll().subscribe((res)=>{
      if(res){
        this.eventos=res;
        this.dataSource2 = new MatTableDataSource(this.eventos);
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
    sessionStorage.setItem("oldResumen", event);
  }

  addResumen(){
    localStorage.setItem('resumen-back','eventos');
    this._router.navigate(['dashboard/add-resumen']);
  }

  editResumen(id){
    localStorage.setItem('resumen-back','eventos');
    this._router.navigate(['dashboard/edit-resumen/'+id]);
  }

  addEvento(){
    this._router.navigate(['dashboard/add-evento']);
  }

  editEvento(idEvento){
    this._router.navigate(['dashboard/edit-evento/'+idEvento]);
  }
}
