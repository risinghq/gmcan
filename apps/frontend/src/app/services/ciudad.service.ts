import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class CiudadService{
    public url: string;

    languagelocal;
    constructor(public http: HttpClient){
      this.url = GLOBAL.url;
      this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
    }
    
    getCiudadesAll(): any{
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
    });
      if(this.languagelocal=="es"){
        return this.http.get(this.url+'ciudad/get-ciudad',{headers:headers});
      }else{
        return this.http.get(this.url+'ciudad/get-ciudad-en',{headers:headers});
      }
    }
    getCiudad(idCiudad): any{
      let headers = new HttpHeaders ({
        'Content-Type':'application/json'
      });
      if(this.languagelocal=="es"){
        return this.http.get(this.url+'ciudad/get-ciudad/'+idCiudad,{headers:headers});
      }else{
        return this.http.get(this.url+'ciudad/get-ciudad-en/'+idCiudad,{headers:headers});
      }
    }
    getCiudades(idPais): any{
      let headers = new HttpHeaders ({
        'Content-Type':'application/json'
      });
      if(this.languagelocal=="es"){
        return this.http.get(this.url+'ciudad/get-ciudades/'+idPais,{headers:headers});
      }else{
        return this.http.get(this.url+'ciudad/get-ciudades-en/'+idPais,{headers:headers});
      }
  }

}