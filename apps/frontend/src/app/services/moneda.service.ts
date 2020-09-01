import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {GLOBAL} from './global';

@Injectable({
	providedIn: 'root'
  })
export class MonedaService{
    public url: string;
    JWT_TOKEN = 'JWT_TOKEN';

  languagelocal;
  constructor(public http: HttpClient){
    this.url = GLOBAL.url;
  }
    
  getMonedas(): any{
    let headers = new HttpHeaders ({
		'Content-Type':'application/json'
	});
    return this.http.get(this.url+'moneda/get-moneda',{headers:headers});
  }
    
  getMoneda(idMoneda): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    return this.http.get(this.url+'moneda/get-moneda/'+idMoneda,{headers:headers});
  }

}