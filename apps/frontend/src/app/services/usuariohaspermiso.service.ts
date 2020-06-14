import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
  })
export class UsuarioHasPermisoService{

  JWT_TOKEN = 'JWT_TOKEN';
  REFRESH_TOKEN = 'REFRESH_TOKEN';
    public url: string;

  constructor(public http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    getUsuarioHasPermiso(DNI): any{
      let headers = new HttpHeaders ({
        'Content-Type':'application/json',
        'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
	    });
      return this.http.get(this.url+'usuariohaspermiso/get-usuariohaspermiso/'+DNI,{headers:headers});
    }

}