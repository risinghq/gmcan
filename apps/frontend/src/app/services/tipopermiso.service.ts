import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class UsuarioHasPermisoService{
    public url: string;

	constructor(public http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    getUsuarioHasPermiso(): any{
        let token=JSON.parse(localStorage.getItem("token"));
        let headers = new HttpHeaders ({
            'Content-Type':'application/json',
            'Authorization':'Bearer '+token
		});
        return this.http.get(this.url+'tipopermiso/get-tipopermiso/',{headers:headers});
    }

}