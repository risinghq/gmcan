import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class SearchService{
    public url: string;

	constructor(private http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    searchPublicaciones(nombre,id): any{
        let body = {"titulo":nombre,"tipoPublicacion_idTipoPublicacion":id};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.post(this.url+'publicacion/search-publicaciones',body,{headers});
    }
    searchAutores(nombre): any{
        let body = {"nombre":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.post(this.url+'autor/search-autores',body,{headers});
    }
    searchUsuarios(nombre): any{
        let body = {"nombre":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.post(this.url+'usuario/search-usuarios',body,{headers});
    }
}
