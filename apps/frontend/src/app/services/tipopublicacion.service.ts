import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class TipoPublicacionService{
    public url: string;

	languagelocal;
  constructor(public http: HttpClient){
    this.url = GLOBAL.url;
    this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
  }
    
  getTipoPublicaciones(): any{
    let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'tipo-publicacion/get-tipopublicacion',{headers:headers});
    }else{
      return this.http.get(this.url+'tipo-publicacion/get-tipopublicacion-en',{headers:headers});
    }
  }

  getTipoPublicacion(idTipoPublicacion){
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'tipo-publicacion/get-tipopublicacion/'+idTipoPublicacion,{headers:headers});
    }else{
      return this.http.get(this.url+'tipo-publicacion/get-tipopublicacion-en/'+idTipoPublicacion,{headers:headers});
    }
  }

}