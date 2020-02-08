import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class TipoNoticiaService{
    public url: string;

	constructor(private http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    getTipoNoticia(): any{
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.get(this.url+'tipo-noticia/get-tiponoticia',{headers:headers});
    }

    getTipoNews(idTipoNoticia){
      let headers = new HttpHeaders ({
        'Content-Type':'application/json'
      });
          return this.http.get(this.url+'tipo-noticia/get-tiponoticia/'+idTipoNoticia,{headers:headers});
    }

}