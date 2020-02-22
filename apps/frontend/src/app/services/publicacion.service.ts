import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class PublicacionService{
    public url: string;

	constructor(private http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    getPublicacion(): any{
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.get(this.url+'publicacion/get-publicacion',{headers:headers});
    }
    getPublicaciones(idTipoPublicacion): any{
      let headers = new HttpHeaders ({
        'Content-Type':'application/json'
      });
      return this.http.get(this.url+'publicacion/get-publicaciones/'+idTipoPublicacion,{headers:headers});
    }
    getPublication(idPublicacion): any{
      let headers = new HttpHeaders ({
        'Content-Type':'application/json'
      });
      return this.http.get(this.url+'publicacion/get-publicacion/'+idPublicacion,{headers:headers});
    }

}