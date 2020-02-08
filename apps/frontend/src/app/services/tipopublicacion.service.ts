import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class TipoPublicacionService{
    public url: string;

	constructor(private http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    getTipoPublicaciones(): any{
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.get(this.url+'tipo-publicacion/get-tipopublicacion',{headers:headers});
    }

    getTipoPublicacion(idTipoPublicacion){
      let headers = new HttpHeaders ({
        'Content-Type':'application/json'
      });
          return this.http.get(this.url+'tipo-publicacion/get-tipopublicacion/'+idTipoPublicacion,{headers:headers});
    }

}