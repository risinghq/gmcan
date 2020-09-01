import { Component, OnInit, ViewChild } from '@angular/core';
import { RevistaService } from '../services/revista.service';
import { Revista } from '../models/revista';
import { Publicacion } from '../models/publicacion';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Router } from '@angular/router';
import { PublicacionService } from '../services/publicacion.service';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { PublicacionHasUsuarioService } from '../services/publicacionhasusuario.service';
import { UsuarioService } from '../services/usuario.service';
import { PublicacionHasAutorService } from '../services/publicacionhasautor.service';
import { AutorService } from '../services/autor.service';
import { GLOBAL } from '../services/global';

@Component({
  selector: 'app-articulos',
  templateUrl: './articulos.component.html',
  styleUrls: ['./articulos.component.scss']
})
export class ArticulosComponent implements OnInit {

  displayedColumns: string[] = ['titulo', 'primerAutor', 'publicacion', 'DOI'];
  displayedColumns2: string[] = ['nombre'];
  dataSource: MatTableDataSource<Publicacion>;
  dataSource2: MatTableDataSource<Revista>;

  revistas: Array<Revista>;
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
  ) {
    this.url=GLOBAL.url;
  }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @ViewChild(MatPaginator, {static: true}) paginator2: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort2: MatSort;

  selectedTab;
  ngOnInit() {
    this.selectedTab=sessionStorage.getItem("oldArticle");
    this.getRevistas();
    this.getArticles();
  }
  
  getArticles(){
    this._publicacionService.getPublicaciones(1).subscribe((res)=>{
      if(res){
        res.sort((a,b) => (a.fechaPublicacion < b.fechaPublicacion) ? 1 : ((b.fechaPublicacion < a.fechaPublicacion) ? -1 : 0));
        this.articulos=res;
        for (let index = 0; index < this.articulos.length; index++) {
          this.articulos[index].fecha=this.datePipe.transform(this.articulos[index].fechaPublicacion,"MMMM, y", "es");
          this.articulos[index].fecha=this.titlecasePipe.transform(this.articulos[index].fecha);
          this.articulos[index].usuario=[];
          this.articulos[index].autor=[];
          this.getArticlesUsers(this.articulos[index]);
          this.getArticlesAuthors(this.articulos[index]);
        }
        this.dataSource = new MatTableDataSource(this.articulos);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
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

  getRevistas(){
    this._revistasService.getRevistas().subscribe((res)=>{
      if(res){
        this.revistas=res;
        this.dataSource2 = new MatTableDataSource(this.revistas);
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
    sessionStorage.setItem("oldArticle", event);
  }

  addRevista(){
    this._router.navigate(['dashboard/add-revista']);
  }

  editRevista(id){
    this._router.navigate(['dashboard/edit-revista/'+id]);
  }

  addArticle(){
    localStorage.setItem('article-back','articulos');
    this._router.navigate(['dashboard/add-article/']);
  }

  editArticulo(id){
    localStorage.setItem('article-back','articulos');
    this._router.navigate(['dashboard/edit-article/'+id]);
  }
}
