import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class UsuarioService{
    public url: string;

	languagelocal;
	constructor(public http: HttpClient){
    this.url = GLOBAL.url;
    this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
  }
    
  getUsuario(): any{
    let headers = new HttpHeaders ({
		  'Content-Type':'application/json'
	  });
    return this.http.get(this.url+'usuario/get-usuario-name',{headers:headers});
  }

  getUser(idUsuario): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'usuario/get-usuario/'+idUsuario,{headers:headers});
    }else{
      return this.http.get(this.url+'usuario/get-usuario-en/'+idUsuario,{headers:headers});
    } 
  }

  getUsuarios():any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'usuario/get-usuario',{headers:headers});
    }else{
      return this.http.get(this.url+'usuario/get-usuario-en',{headers:headers});
    } 
  }

}