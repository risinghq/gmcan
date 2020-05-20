import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class PermisoService{
    public url: string;

	languagelocal;
  constructor(public http: HttpClient){
    this.url = GLOBAL.url;
  }
    
  getPermisos(): any{
    let headers = new HttpHeaders ({
		'Content-Type':'application/json'
	});
    return this.http.get(this.url+'permiso/get-permiso',{headers:headers});
  }
  getPermiso(idPermiso){
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    return this.http.get(this.url+'permiso/get-permiso/'+idPermiso,{headers:headers});        
  }

}