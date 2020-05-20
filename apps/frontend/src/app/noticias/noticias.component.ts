import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { NoticiaService } from '../services/noticia.service';
import { UsuarioService } from '../services/usuario.service';
import { TipoNoticiaService } from '../services/tiponoticia.service';
import { Noticia } from '../models/noticia';
import { TipoNoticia } from '../models/tiponoticia';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { GLOBAL } from '../services/global';

@Component({
  selector: 'app-noticias',
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.scss']
})
export class NoticiasComponent implements OnInit {

  displayedColumns: string[] = ['titulo', 'fechaPublicacion', 'nombreTipoNoticia', 'autor', 'status'];
  displayedColumns2: string[] = ['nombre'];
  dataSource: MatTableDataSource<Noticia>;
  dataSource2: MatTableDataSource<TipoNoticia>;

  url
  public noticias: Array<Noticia>;
  public tiponoticias: Array<TipoNoticia>

  ngOnInit(){
    this.getTipoNoticias(); 
  }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @ViewChild(MatPaginator, {static: true}) paginator2: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort2: MatSort;

  constructor(
    public _noticiaService:NoticiaService,
    public _usuarioService: UsuarioService,
    public _tiponoticiaService: TipoNoticiaService,
    public titlecasePipe:TitleCasePipe,
    public datePipe: DatePipe,
  ) {
    this.url=GLOBAL.url;
  }

  /**
   * Set the paginator and sort after the view init since this component will
   * be able to query its view for the initialized paginator and sort.
   */
  ngAfterViewInit() {
  }

  getNoticia(){
    this._noticiaService.getNoticias().subscribe((res)=>{
      if(res!=null){
        res.sort((a,b) => (a.fechaPublicacion < b.fechaPublicacion) ? 1 : ((b.fechaPublicacion < a.fechaPublicacion) ? -1 : 0));
        this.noticias=res;
        this.dataSource = new MatTableDataSource(this.noticias);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        for (let index = 0; index < this.noticias.length; index++) {
          for (let j = 0; j < this.tiponoticias.length; j++) {
            if (this.noticias[index].tipoNoticia_idtipoNoticia===this.tiponoticias[j].idtipoNoticia) {
              this.noticias[index].nombreTipoNoticia=this.tiponoticias[j].nombre;
            }
            if (this.noticias[index].estado===1) {
              this.noticias[index].status="Activo";
            }else{
              this.noticias[index].status="Inactivo";
            }
          }
          this.noticias[index].fechaPublicacion=this.datePipe.transform(this.noticias[index].fechaPublicacion,"MMMM dd, y", "es");
          this.noticias[index].fechaPublicacion=this.titlecasePipe.transform(this.noticias[index].fechaPublicacion);
          this.getUsuario(this.noticias[index].autorPublicacion, index);
        }
      }
    });
  }

  getTipoNoticias(){
    this._tiponoticiaService.getTipoNoticia().subscribe((res)=>{
      res.sort((a,b) => a.nombre > b.nombre ? 1 : -1)
      this.tiponoticias=res;
      this.dataSource2 = new MatTableDataSource(this.tiponoticias);
      this.dataSource2.paginator = this.paginator2;
      this.dataSource2.sort = this.sort2;
      this.getNoticia();
    });
  }

  getUsuario(idUser, i){
    this._usuarioService.getUser(idUser).subscribe((res)=>{
      if(res[0]!=undefined){
        if(this.noticias[i]!=undefined){
          this.noticias[i].autor=res[0].nombre+" "+res[0].apellidoPaterno;
          this.noticias[i].foto=res[0].foto;
        }
      }
    });
  }  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
  }
}