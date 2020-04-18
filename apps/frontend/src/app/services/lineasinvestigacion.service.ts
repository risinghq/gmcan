import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class LineasInvestigacionService{
  public url: string;

  languagelocal;
  constructor(public http: HttpClient){
    this.url = GLOBAL.url;
    this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
  }
    
  getLineasInvestigacion(): any{
    let headers = new HttpHeaders ({
		  'Content-Type':'application/json'
		});
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'lineasinvestigacion/get-lineasinvestigacion',{headers:headers});
    }else{
      return this.http.get(this.url+'lineasinvestigacion/get-lineasinvestigacion-en',{headers:headers});
    }
  }

  getLineasInvestigaciones(idLinea): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'lineasinvestigacion/get-lineasinvestigacions/'+idLinea,{headers:headers});
    }else{
      return this.http.get(this.url+'lineasinvestigacion/get-lineasinvestigacions-en/'+idLinea,{headers:headers});
    }
  }
    
  getLineaInvestigacion(idLineasInvestigacion): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'lineasinvestigacion/get-lineasinvestigacion/'+idLineasInvestigacion,{headers:headers});
    }else{
      return this.http.get(this.url+'lineasinvestigacion/get-lineasinvestigacion-en/'+idLineasInvestigacion,{headers:headers});
    }
  }

}