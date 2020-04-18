import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class NoticiaService{
    public url: string;

  languagelocal;
  constructor(public http: HttpClient){
    this.url = GLOBAL.url;
    this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
  }
    
  getNoticias(): any{
    let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'noticia/get-noticia',{headers:headers});
    }else{
      return this.http.get(this.url+'noticia/get-noticia-en',{headers:headers});
    }
  }
    
  getNoticia(idNoticia){
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'noticia/get-noticia/'+idNoticia,{headers:headers});
    }else{
      return this.http.get(this.url+'noticia/get-noticia-en/'+idNoticia,{headers:headers});
    }
  }

  getNoticiaTipo(idTipo): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'noticia/get-noticiatipo/'+idTipo,{headers:headers});
    }else{
      return this.http.get(this.url+'noticia/get-noticiatipo-en/'+idTipo,{headers:headers});
    }
  }

  getNoticiaUsuario(idUsuario): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'noticia/get-noticiausuario/'+idUsuario,{headers:headers});
    }else{
      return this.http.get(this.url+'noticia/get-noticiausuario-en/'+idUsuario,{headers:headers});
    }
  }

}