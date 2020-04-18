import { Component, OnInit, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { Noticia } from '../models/noticia';
import { NoticiaService } from '../services/noticia.service';
import { DatePipe } from '@angular/common';
import { TipoNoticia } from '../models/tiponoticia';
import { TipoNoticiaService } from '../services/tiponoticia.service';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { UsuarioService } from '../services/usuario.service';


@Component({
  selector: 'app-main-news',
  templateUrl: './main-news.component.html',
  styleUrls: ['./main-news.component.scss']
})
export class MainNewsComponent implements OnInit {

  public noticias: Array<Noticia>;
  public tiponoticias: Array<TipoNoticia>
  public screenWidth;
  constructor(
    public titlecasePipe:TitleCasePipe,
    public datePipe: DatePipe,
    public _noticiaService: NoticiaService,
    public _route: ActivatedRoute,
    public _tiponoticiaService: TipoNoticiaService,
    public location: Location,
    public _router: Router,
    public _usuarioService: UsuarioService,
  ) { 
    this.screenWidth = window.innerWidth;
    this.noticias=[];
  }
  numberShown;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenWidth = window.innerWidth;
  }
  public categorySelected=-1;
  public categoryNombre;
  public page;
  public pageSize;
  language;
  ngOnInit() {
    this.language=JSON.parse(localStorage.getItem("language"));
    this.categoryNombre=this.language.newsText[0].categoryTitle;
    this.page = 1;
    this.pageSize =10;
    this.getTipoNoticias();
  }
  getNoticia(){
    this._noticiaService.getNoticias().subscribe((res)=>{
      if(res!=null){
        res.sort((a,b) => (a.fechaPublicacion < b.fechaPublicacion) ? 1 : ((b.fechaPublicacion < a.fechaPublicacion) ? -1 : 0));
        this.noticias=res;
        for (let index = 0; index < this.noticias.length; index++) {
          if(this.noticias[index].tipoNoticia_idtipoNoticia != this.categorySelected && this.categorySelected !=-1){
            this.noticias.splice(index,1);
            index=-1;
          }
        }
        for (let index = 0; index < this.noticias.length; index++) {
          for (let j = 0; j < this.tiponoticias.length; j++) {
            if (this.noticias[index].tipoNoticia_idtipoNoticia===this.tiponoticias[j].idtipoNoticia) {
              this.noticias[index].nombreTipoNoticia=this.tiponoticias[j].nombre;
            }
          }
          this.noticias[index].fechaPublicacion=this.datePipe.transform(this.noticias[index].fechaPublicacion,"MMMM dd, y", "es");
          this.noticias[index].fechaPublicacion=this.titlecasePipe.transform(this.noticias[index].fechaPublicacion);
          this.getUsuario(this.noticias[index].autorPublicacion, index)
        }
      }
    });
  }

  selectCategory(idtipoNoticia, nombre){
    this.categorySelected=idtipoNoticia;
    this.categoryNombre=nombre;
    this.getNoticia();
    this.page=1;
  }
  getTipoNoticias(){
    this._tiponoticiaService.getTipoNoticia().subscribe((res)=>{
      res.sort((a,b) => a.nombre > b.nombre ? 1 : -1)
      this.tiponoticias=res;
      this.getNoticia();
    });
  }

  detalleNoticia(noticia){
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(['/detail-news/'+noticia.idNoticia]);
    this.scroll();
    this.getTipoNoticias();
  }
  scroll() {
    let el= document.getElementById("main-toolbar");
    el.scrollIntoView({ behavior: "smooth"});
  }

  getUsuario(idUser, i){
    this._usuarioService.getUser(idUser).subscribe((res)=>{
      if(res[0]!=undefined){
        if(this.noticias[i]!=undefined){
          this.noticias[i].autor=res[0].nombre+" "+res[0].apellidoPaterno;
        }
      }
    });
  }

}
