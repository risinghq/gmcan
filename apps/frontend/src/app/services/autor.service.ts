import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class AutorService{
    public url: string;
    JWT_TOKEN = 'JWT_TOKEN';

	constructor(public http: HttpClient){
		this.url = GLOBAL.url;
  }
    
  getAutor(): any{
    let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
    return this.http.get(this.url+'autor/get-autor',{headers:headers});
  }

  getAuthor(idAutor): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    return this.http.get(this.url+'autor/get-autor/'+idAutor,{headers:headers});
  }

  addAuthor(autor): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
    });
    return this.http.post(this.url+'autor/post-autor/', autor, {headers:headers});
  }

}