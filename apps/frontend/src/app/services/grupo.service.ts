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

	languagelocal;
    constructor(public http: HttpClient){
      this.url = GLOBAL.url;
      if(JSON.parse(localStorage.getItem("language"))){
        this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
      }else{
          this.languagelocal="es";
      }
    }
    
    getGrupoInfo(){
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        if(this.languagelocal=="es"){
            return this.http.get(this.url+'grupo/get-grupo',{headers:headers});
        }else{
            return this.http.get(this.url+'grupo/get-grupo-en',{headers:headers});
        }
    }
    getGrupoImage(imageFile){
        console.log(this.url+'grupo/get-image-grupo/'+imageFile);
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.get(this.url+'grupo/get-image-grupo/'+imageFile,{responseType: 'text'});;
    }

}