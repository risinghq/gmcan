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
import { GLOBAL } from '../services/global';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  public noticias: Array<Noticia>;
  public noticiaPrincipal: Noticia;
  public tiponoticias: Array<TipoNoticia>;
  url;
  
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
    this.noticiaPrincipal = new Noticia(null,'','','','',0,'',null,null,'','',null,'',null);
    this.noticias=[];
    this.url=GLOBAL.url
  }
  numberShown;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if(window.innerWidth>=1300){
      this.numberShown=10;
    }else{
      this.numberShown=5;
    }
  }
  public title;
  public idNoticiaE;
  language;
  ngOnInit() {
    this.language=JSON.parse(localStorage.getItem("language"));
    if(window.innerWidth>=1300){
      this.numberShown=10;
    }else{
      this.numberShown=5;
    }
    this.getTipoNoticias();
    this._route.params.forEach((params:Params)=>{
      this.idNoticiaE = params['id'];
    });
    console.log(this.idNoticiaE)
  }
  ngDoCheck(){
    this.title=this.language.news;
    if(this.location.path().slice(1,12)==="detail-news"){
      this.title=this.language.moreNews;
    }
  }
  getNoticia(){
    this._noticiaService.getNoticias().subscribe((res)=>{
      if(res!=null){
        res.sort((a,b) => (a.fechaPublicacion < b.fechaPublicacion) ? 1 : ((b.fechaPublicacion < a.fechaPublicacion) ? -1 : 0));
        this.noticias=res;
        for (let index = 0; index < this.noticias.length; index++) {
          if(this.noticias[index].idNoticia==this.idNoticiaE || this.noticias[index].estado==0){
            this.noticias.splice(index,1);
            index--;
            continue;
          }
          for (let j = 0; j < this.tiponoticias.length; j++) {
            if (this.noticias[index].tipoNoticia_idtipoNoticia===this.tiponoticias[j].idtipoNoticia) {
              this.noticias[index].nombreTipoNoticia=this.tiponoticias[j].nombre;
            }
          }
          this.noticias[index].fechaPublicacion=this.datePipe.transform(this.noticias[index].fechaPublicacion,"MMMM dd, y", "es");
          this.noticias[index].fechaPublicacion=this.titlecasePipe.transform(this.noticias[index].fechaPublicacion);
          this.getUsuario(this.noticias[index].autorPublicacion, index);
        }
        this.noticiaPrincipal=this.noticias[0];
        this.noticias.splice(0,1);
        this.getUser(this.noticiaPrincipal.autorPublicacion);
      }
    });
  }
  getTipoNoticias(){
    this._tiponoticiaService.getTipoNoticia().subscribe((res)=>{
      this.tiponoticias=res;
      this.getNoticia();
    });
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
  getUser(idUser){
    this._usuarioService.getUser(idUser).subscribe((res)=>{
      if(res[0]!=undefined){
        if(this.noticiaPrincipal!=undefined){
          this.noticiaPrincipal.autor=res[0].nombre+" "+res[0].apellidoPaterno;
        }
      }
    });
  }

  detalleNoticia(noticia){
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(['/home/detail-news/'+noticia.idNoticia]);
    this.scroll(document.getElementById("main-toolbar"));
    this.getTipoNoticias();
  }
  scroll(el: HTMLElement) {
    el.scrollIntoView({ behavior: "smooth"});
  }

}
