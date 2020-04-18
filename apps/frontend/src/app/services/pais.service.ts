import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class PaisService{
    public url: string;

	languagelocal;
  constructor(public http: HttpClient){
    this.url = GLOBAL.url;
    this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
  }
    
  getPaisesAll(): any{
    let headers = new HttpHeaders ({
		  'Content-Type':'application/json'
	  });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'pais/get-pais',{headers:headers});
    }else{
      return this.http.get(this.url+'pais/get-pais-en',{headers:headers});
    }
  }
  getPais(idPais): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'pais/get-pais/'+idPais,{headers:headers});        
    }else{
      return this.http.get(this.url+'pais/get-pais-en/'+idPais,{headers:headers});        
    }
  }

}