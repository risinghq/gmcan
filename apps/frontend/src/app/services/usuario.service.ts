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

	constructor(private http: HttpClient){
		this.url = GLOBAL.url;
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
      return this.http.get(this.url+'usuario/get-usuario/'+idUsuario,{headers:headers});
  }

}