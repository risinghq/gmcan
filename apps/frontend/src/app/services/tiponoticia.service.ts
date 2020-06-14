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
  JWT_TOKEN = 'JWT_TOKEN';
  REFRESH_TOKEN = 'REFRESH_TOKEN';

	languagelocal;
  constructor(public http: HttpClient){
    this.url = GLOBAL.url;
    this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
  }
    
  getTipoNoticia(): any{
    let headers = new HttpHeaders ({
	  	'Content-Type':'application/json'
		});
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'tipo-noticia/get-tiponoticia',{headers:headers});
    }else{
      return this.http.get(this.url+'tipo-noticia/get-tiponoticia-en',{headers:headers});
    }
  }

  getTipoNews(idTipoNoticia){
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'tipo-noticia/get-tiponoticia/'+idTipoNoticia,{headers:headers});
    }else{
      return this.http.get(this.url+'tipo-noticia/get-tiponoticia-en/'+idTipoNoticia,{headers:headers});
    }
  }

  addCategory(category):any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.post(this.url+'tipo-noticia/post-tiponoticia',category,{headers});
  }  

  updateCategory(category):any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.put(this.url+'tipo-noticia/update-tiponoticia',category,{headers});
  }  

  deleteCategory(idCategory):any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.delete(this.url+'tipo-noticia/delete-tiponoticia/'+idCategory,{headers});
  }  

}