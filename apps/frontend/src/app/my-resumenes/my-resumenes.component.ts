import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Publicacion } from '../models/publicacion';
import { Router } from '@angular/router';
import { RevistaService } from '../services/revista.service';
import { PublicacionService } from '../services/publicacion.service';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { PublicacionHasUsuarioService } from '../services/publicacionhasusuario.service';
import { PublicacionHasAutorService } from '../services/publicacionhasautor.service';
import { UsuarioService } from '../services/usuario.service';
import { AutorService } from '../services/autor.service';
import { UsuarioHasPermisoService } from '../services/usuariohaspermiso.service';
import { GLOBAL } from '../services/global';
import { EventoService } from '../services/evento.service';

@Component({
  selector: 'app-my-resumenes',
  templateUrl: './my-resumenes.component.html',
  styleUrls: ['./my-resumenes.component.scss']
})
export class MyResumenesComponent implements OnInit {

  displayedColumns: string[] = ['titulo', 'primerAutor', 'publicacion', 'evento'];
  dataSource: MatTableDataSource<Publicacion>;

  articulos: Array<Publicacion>;
  url;

  constructor(
    public _router: Router,
    public _revistasService: RevistaService,
    private _publicacionService: PublicacionService,
    public titlecasePipe:TitleCasePipe,
    public datePipe: DatePipe,
    private _publicacionhasusuarioService: PublicacionHasUsuarioService,
    private _publicacionhasautorService: PublicacionHasAutorService,
    private _usuarioService: UsuarioService,
    private _autorService: AutorService,
    public _usuarioHasPermisoService: UsuarioHasPermisoService,
    private _eventoService: EventoService,
  ) {
    this.url=GLOBAL.url;
  }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  selectedTab;
  ngOnInit() {
    this.getUserArticles();
  }

  getUserArticles(){
    let user= this._usuarioService.getUserLogged();
    this.getPermisoHasUsuario(user.DNI);
    this._publicacionhasusuarioService.searchPublicacionHasUsuario(user.DNI).subscribe((res)=>{
      if(res){
        this.articulos=[];
        for (let index = 0; index < res.length; index++) {
          this.getArticle(res[index].publicacion_idPublicacion);
        }
      }
    });
  }
  
  getArticle(idPublicacion){
    this._publicacionService.getPublication(idPublicacion).subscribe((res)=>{
      if(res[0]){
        if(res[0].tipoPublicacion_idTipoPublicacion==3){
          this.articulos.push(res[0]);
          this.articulos.sort((a,b) => (a.fechaPublicacion < b.fechaPublicacion) ? 1 : ((b.fechaPublicacion < a.fechaPublicacion) ? -1 : 0));
          for (let index = 0; index < this.articulos.length; index++) {
            this.articulos[index].fecha=this.datePipe.transform(this.articulos[index].fechaPublicacion,"MMMM, y", "es");
            this.articulos[index].fecha=this.titlecasePipe.transform(this.articulos[index].fecha);
            this.articulos[index].usuario=[];
            this.articulos[index].autor=[];
            this.getArticlesUsers(this.articulos[index]);
            this.getArticlesAuthors(this.articulos[index]);
            this.getSpeEvento(this.articulos[index])
          }
        }
        this.dataSource = new MatTableDataSource(this.articulos);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  getSpeEvento(publicacion){
    this._eventoService.getEvento(publicacion.evento_idEvento).subscribe((res)=>{
      if(res){
        publicacion.evento=res[0].nombre;
      }
    });
  }

  getArticlesUsers(publicacion){
    this._publicacionhasusuarioService.getPublicacionHasUsuario(publicacion.idPublicacion).subscribe((res)=>{
      if(res){
        let indexPrincipal = res.findIndex(x => x.isPrincipal == 1);
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
        let indexPrincipal = res.findIndex(x => x.isPrincipal == 1);
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

  publicacionPermiso=false;

  getPermisoHasUsuario(DNI){
    this._usuarioHasPermisoService.getUsuarioHasPermiso(DNI).subscribe((res)=>{
      if(res.length>0){        
        for (let index = 0; index < res.length; index++) {
          switch (res[index].permiso_idPermiso) {
            case 3:
              this.publicacionPermiso=true;
              break;
            default:
              break;
          } 
        }
      }
    });
  }

  addResumen(){
    localStorage.setItem('resumen-back','my-abstracts');
    this._router.navigate(['dashboard/add-resumen/']);
  }

  editResumen(id){
    this._publicacionhasusuarioService.getPublicacionHasUsuario(id).subscribe((res)=>{
      if(res.length>0){
        let user= this._usuarioService.getUserLogged();
        let index = res.findIndex(res => res.usuario_DNI === user.DNI);
        if((index != -1 && res[index].isPrincipal == 1) || this.publicacionPermiso){
          localStorage.setItem('resumen-back','my-abstracts');
          this._router.navigate(['dashboard/edit-resumen/'+id]);
        }
      }
    });
  }

}
