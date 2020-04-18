import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class TipoNoticiaService{
    public url: string;

	languagelocal;
  constructor(public http: HttpClient){
    this.url = GLOBAL.url;
    this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
  }
    
  getTipoNoticia(): any{
    let headers = new HttpHeaders ({
	  	'Content-Type':'application/json'
		});
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'tipo-noticia/get-tiponoticia',{headers:headers});
    }else{
      return this.http.get(this.url+'tipo-noticia/get-tiponoticia-en',{headers:headers});
    }
  }

  getTipoNews(idTipoNoticia){
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'tipo-noticia/get-tiponoticia/'+idTipoNoticia,{headers:headers});
    }else{
      return this.http.get(this.url+'tipo-noticia/get-tiponoticia-en/'+idTipoNoticia,{headers:headers});
    }
  }

}