import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class EquipoService{
    public url: string;

	constructor(public http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    getEquipos(): any{
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.get(this.url+'equipo/get-equipo',{headers:headers});
    }

}