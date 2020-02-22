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

	constructor(private http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    getUniversidades(): any{
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.get(this.url+'universidad/get-universidad',{headers:headers});
    }

    getUniversidad(idUniversidad){
      let headers = new HttpHeaders ({
        'Content-Type':'application/json'
      });
          return this.http.get(this.url+'universidad/get-universidad/'+idUniversidad,{headers:headers});
    }

}