import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {GLOBAL} from './global';

@Injectable({
	providedIn: 'root'
  })
export class MethodsService{
    public url: string;
    JWT_TOKEN = 'JWT_TOKEN';

  languagelocal;
  constructor(public http: HttpClient){
    this.url = GLOBAL.url;
    this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
  }
    
  getMethods(): any{
    let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'metodo/get-metodo',{headers:headers});
    }else{
      return this.http.get(this.url+'metodo/get-metodo-en',{headers:headers});
    }
  }
    
  getMethod(idNoticia): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'metodo/get-metodo/'+idNoticia,{headers:headers});
    }else{
      return this.http.get(this.url+'metodo/get-metodo-en/'+idNoticia,{headers:headers});
    }
  }

  addMetodo(metodo):any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
    });
    return this.http.post(this.url+'metodo/post-metodo/',metodo,{headers:headers});
  }

  updateMetodo(metodo):any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
    });
    return this.http.put(this.url+'metodo/update-metodo/',metodo,{headers:headers});
  }

  deleteMetodo(idMetodo):any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
    });
    return this.http.delete(this.url+'metodo/delete-metodo/'+idMetodo,{headers:headers});
  }

  uploadMetodoFoto(fileData, id){
    const formData = new FormData();
    formData.append('foto', fileData, fileData.name); 
    let headers = new HttpHeaders ({
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.put(this.url+'metodo/upload-metodo-foto/'+id, formData, {headers});
  }

}