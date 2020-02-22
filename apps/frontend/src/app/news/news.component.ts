import { Component, OnInit, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { Noticia } from '../models/noticia';
import { NoticiaService } from '../services/noticia.service';
import { DatePipe } from '@angular/common';
import { TipoNoticia } from '../models/tiponoticia';
import { TipoNoticiaService } from '../services/tiponoticia.service';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  private noticias: Array<Noticia>;
  private noticiaPrincipal: Noticia;
  private tiponoticias: Array<TipoNoticia>
  
  constructor(
    private titlecasePipe:TitleCasePipe,
    private datePipe: DatePipe,
    private _noticiaService: NoticiaService,
    private _route: ActivatedRoute,
    private _tiponoticiaService: TipoNoticiaService,
    private location: Location,
    private _router: Router,
  ) { 
    this.noticiaPrincipal = new Noticia(null,'','','','',null,null,'','',null,'');
    this.noticias=[];
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
  private title;
  private idNoticiaE;
  ngOnInit() {
    this.title="Noticias";
    if(this.location.path().slice(1,12)==="detail-news"){
      this.title="Más Noticias";
    }
    if(window.innerWidth>=1300){
      this.numberShown=10;
    }else{
      this.numberShown=5;
    }
    this.getTipoNoticias();
    this._route.params.forEach((params:Params)=>{
      this.idNoticiaE = params['id'];
    });
  }
  getNoticia(){
    this._noticiaService.getNoticias().subscribe((res)=>{
      if(res!=null){
        res.sort((a,b) => (a.fechaPublicacion < b.fechaPublicacion) ? 1 : ((b.fechaPublicacion < a.fechaPublicacion) ? -1 : 0));
        this.noticias=res;
        for (let index = 0; index < this.noticias.length; index++) {
          if(this.noticias[index].idNoticia==this.idNoticiaE){
            this.noticias.splice(index,1);
          }
          for (let j = 0; j < this.tiponoticias.length; j++) {
            if (this.noticias[index].tipoNoticia_idtipoNoticia===this.tiponoticias[j].idtipoNoticia) {
              this.noticias[index].nombreTipoNoticia=this.tiponoticias[j].nombre;
            }
          }
          this.noticias[index].fechaPublicacion=this.datePipe.transform(this.noticias[index].fechaPublicacion,"MMMM dd, y", "es");
          this.noticias[index].fechaPublicacion=this.titlecasePipe.transform(this.noticias[index].fechaPublicacion);
        }
        this.noticiaPrincipal=this.noticias[0];
        this.noticias.splice(0,1);
      }
    });
  }
  getTipoNoticias(){
    this._tiponoticiaService.getTipoNoticia().subscribe((res)=>{
      this.tiponoticias=res;
      this.getNoticia();
    });
  }

  detalleNoticia(noticia){
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(['/detail-news/'+noticia.idNoticia]);
    this.scroll(document.getElementById("main-toolbar"));
    this.getTipoNoticias();
  }
  scroll(el: HTMLElement) {
    el.scrollIntoView({ behavior: "smooth"});
  }

}
