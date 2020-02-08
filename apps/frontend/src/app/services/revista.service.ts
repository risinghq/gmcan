import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class RevistaService{
    public url: string;

	constructor(private http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    getRevistas(): any{
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.get(this.url+'revista/get-revista',{headers:headers});
    }

    getRevista(idRevista){
      let headers = new HttpHeaders ({
        'Content-Type':'application/json'
      });
          return this.http.get(this.url+'revista/get-revista/'+idRevista,{headers:headers});
    }
}
