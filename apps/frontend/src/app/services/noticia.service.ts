import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class NoticiaService{
    public url: string;

	constructor(private http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    getNoticias(): any{
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.get(this.url+'noticia/get-noticia',{headers:headers});
    }
    
    getNoticia(idNoticia){
      let headers = new HttpHeaders ({
        'Content-Type':'application/json'
      });
          return this.http.get(this.url+'noticia/get-noticia/'+idNoticia,{headers:headers});
    }

}