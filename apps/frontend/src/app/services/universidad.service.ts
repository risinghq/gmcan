import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class UniversidadService{
  public url: string;
  languagelocal;
	constructor(public http: HttpClient){
    this.url = GLOBAL.url;
    this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
  }
    
  getUniversidades(): any{
    let headers = new HttpHeaders ({
		  'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'universidad/get-universidad',{headers:headers});
    }else{
      return this.http.get(this.url+'universidad/get-universidad-en',{headers:headers});
    }      
  }

  getUniversidad(idUniversidad){
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'universidad/get-universidad/'+idUniversidad,{headers:headers});
    }else{
      return this.http.get(this.url+'universidad/get-universidad-en/'+idUniversidad,{headers:headers});
    }
  }
}