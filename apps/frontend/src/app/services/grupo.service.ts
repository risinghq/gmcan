import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class GrupoService{
    public url: string;

	constructor(private http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    getGrupoInfo(){
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.get(this.url+'grupo/get-grupo',{headers:headers});
    }
    getGrupoImage(imageFile){
        console.log(this.url+'grupo/get-image-grupo/'+imageFile);
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.get(this.url+'grupo/get-image-grupo/'+imageFile,{responseType: 'text'});;
    }

}