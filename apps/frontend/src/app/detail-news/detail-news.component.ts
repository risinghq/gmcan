import { Component, OnInit } from '@angular/core';
import { Noticia } from '../models/noticia';
import { NoticiaService } from '../services/noticia.service';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { TipoNoticiaService } from '../services/tiponoticia.service';
import { PreviousPageService } from '../services/previouspage.service';
import { DatePipe } from '@angular/common';
import { Usuario } from '../models/usuario';
import { UsuarioService } from '../services/usuario.service';
import { TitleCasePipe } from '@angular/common';
import { GLOBAL } from '../services/global';

@Component({
  selector: 'app-detail-news',
  templateUrl: './detail-news.component.html',
  styleUrls: ['./detail-news.component.scss']
})
export class DetailNewsComponent implements OnInit {
  public noticia: Noticia;
  public previouspage;
  public previouslink;
  public usuario: Usuario;
  url
  constructor(
    public titlecasePipe:TitleCasePipe,
    public datePipe:DatePipe,
    public _noticiaService: NoticiaService,
    public _tipoNoticiaService: TipoNoticiaService,
    public _route: ActivatedRoute,
    public _router: Router,
    public _previousService: PreviousPageService,
    public _usuarioService: UsuarioService,
  ) {
    this.noticia = new Noticia(null,'','','','',0,'',null,null,'','',null,'',null);
    this.usuario = new Usuario('','','','','','');
    this.url=GLOBAL.url;
   }

  language;
  ngOnInit() {
    this.language=JSON.parse(localStorage.getItem("language"));
    this.cargado=false;
    this.getNoticia();
    this.previouslink=sessionStorage.getItem("previous-page");
    this.previouspage=this._previousService.getPreviousPage(this.previouslink);
  }
  dia;
  mes;
  anio;
  datere:Date;
  cargado;
  public fbicon="../../assets/img/Facebook.svg";
  public twitter="../../assets/img/twitter.svg";
  mouseEnter(int){
    switch (int) {
      case 1:
        this.fbicon="../../assets/img/Facebook2.svg";
        break;
      case 2:
        this.twitter="../../assets/img/twitter2.svg";
        break;
    }
  }

  mouseLeave(int){
    switch (int) {
      case 1:
        this.fbicon="../../assets/img/Facebook.svg";
        break;
      case 2:
        this.twitter="../../assets/img/twitter.svg";
        break;
    }
  }
  getNoticia(){
    this._route.params.forEach((params:Params)=>{
      let idNoticia = params['id'];
      this._noticiaService.getNoticia(idNoticia).subscribe((res)=>{
        this.noticia=res[0];
        this.noticia.fechaPublicacion=this.datePipe.transform(this.noticia.fechaPublicacion,"MM/dd/y", "es");;  
        this.datere=new Date(String(this.noticia.fechaPublicacion));
        this.dia=this.datePipe.transform(this.datere,'dd');
        this.mes=this.datePipe.transform(this.datere,'MMMM');
        this.anio=this.datePipe.transform(this.datere,'y');
        document.getElementById("newsBody").innerHTML=this.noticia.cuerpo;
        this.getTipoNoticia(this.noticia.tipoNoticia_idtipoNoticia);
        this.getUsuario(this.noticia.autorPublicacion);
      });
      this.cargado=true;
    });    
  }

  getTipoNoticia(idTipoNoticia){
    this._tipoNoticiaService.getTipoNews(idTipoNoticia).subscribe((res)=>{
      console.log(res);
      this.noticia.nombreTipoNoticia=res[0].nombre;
    });
  }

  getUsuario(idUsuario){
    this._usuarioService.getUser(idUsuario).subscribe((res)=>{
      this.usuario=res[0];
    });
  }

  fb(e) {
    let url = 'www.google.com';
    e.preventDefault();
    var facebookWindow = window.open(
      'https://www.facebook.com/sharer/sharer.php?localhost:4200/detail-news/5='+ ' Don’t delay, join the match today! url',
      'facebook-popup',
      'height=350,width=600'
    );
    if (facebookWindow.focus) {
      facebookWindow.focus();
    }
    return false;
  }

}
