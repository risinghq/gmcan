import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {GLOBAL} from './global';

@Injectable({
	providedIn: 'root'
  })
export class PrefijoService{
    public url: string;

	constructor(public http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    getPrefijos(): any{
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.get(this.url+'prefijo/get-prefijo',{headers:headers});
    }

}