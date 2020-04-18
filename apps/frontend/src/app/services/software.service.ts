import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class SoftwareService{
    public url: string;

	languagelocal;
    constructor(public http: HttpClient){
      this.url = GLOBAL.url;
      this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
    }
    
    getSoftware(): any{
        let headers = new HttpHeaders ({
                'Content-Type':'application/json'
            });
        if(this.languagelocal=="es"){
          return this.http.get(this.url+'software/get-software',{headers:headers});
        }else{
          return this.http.get(this.url+'software/get-software-en',{headers:headers});
        }
      }
}