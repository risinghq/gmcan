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
import { UniversidadService } from '../services/universidad.service';
import { TipoTesisService } from '../services/tipotesis.service';

@Component({
  selector: 'app-my-thesis',
  templateUrl: './my-thesis.component.html',
  styleUrls: ['./my-thesis.component.scss']
})
export class MyThesisComponent implements OnInit {


  displayedColumns: string[] = ['titulo', 'tipo', 'autores', 'universidad', 'publicacion'];
  dataSource: MatTableDataSource<Publicacion>;
  tesis: Array<Publicacion>;
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
    private _universidadService:UniversidadService,
    private _tipoTesisService: TipoTesisService,
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
        this.tesis=[];
        for (let index = 0; index < res.length; index++) {
          this.getThesis(res[index].publicacion_idPublicacion);
        }
      }
    });
  }
  
  getThesis(idPublicacion){
    this._publicacionService.getPublication(idPublicacion).subscribe((res)=>{
      if(res[0]){
        if(res[0].tipoPublicacion_idTipoPublicacion==2){
          this.tesis.push(res[0]);
          var d = new Date(this.tesis[this.tesis.length-1].fechaPublicacion);
          d.setMinutes( d.getMinutes() + d.getTimezoneOffset());        
          this.tesis[this.tesis.length-1].fecha=this.datePipe.transform(d,"MMMM, y", "es");
          this.tesis[this.tesis.length-1].fecha=this.titlecasePipe.transform(this.tesis[this.tesis.length-1].fecha);
          this.tesis[this.tesis.length-1].usuario=[];
          this.tesis[this.tesis.length-1].autor=[];
          this.getThesisUsers(this.tesis[this.tesis.length-1]);
          this.getThesisAuthors(this.tesis[this.tesis.length-1]);
          this.getTipoThesis(this.tesis[this.tesis.length-1]);
          this.getSpeUniversidad(this.tesis[this.tesis.length-1]);
          this.tesis.sort((a,b) => (a.fechaPublicacion < b.fechaPublicacion) ? 1 : ((b.fechaPublicacion < a.fechaPublicacion) ? -1 : 0));
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
        let user= this._usuarioService.getUserLogged();
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
        publicacion.usuario.push(res[0]);
        publicacion.usuario[0].nombreCompleto=publicacion.usuario[0].nombre+' '+publicacion.usuario[0].apellidoPaterno+' '+publicacion.usuario[0].apellidoMaterno;
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

  addThesis(){
    localStorage.setItem('thesis-back','my-thesis');
    this._router.navigate(['dashboard/add-thesis/']);
  }

  editThesis(id){
    this._publicacionhasusuarioService.getPublicacionHasUsuario(id).subscribe((res)=>{
      if(res.length>0){
        let user= this._usuarioService.getUserLogged();
        let index = res.findIndex(res => res.usuario_DNI === user.DNI);
        if(index != -1 && res[index].isPrincipal == 0 ){
          localStorage.setItem('thesis-back','my-thesis');
          this._router.navigate(['dashboard/edit-thesis/'+id]);
        }
      }
    });
  }

}
