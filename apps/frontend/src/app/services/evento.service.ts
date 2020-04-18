import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class EventoService{
    public url: string;

	constructor(public http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    getEventoesAll(): any{
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.get(this.url+'evento/get-evento',{headers:headers});
    }
    getEvento(idEvento): any{
        let headers = new HttpHeaders ({
          'Content-Type':'application/json'
        });
        return this.http.get(this.url+'evento/get-evento/'+idEvento,{headers:headers});        
    }

}