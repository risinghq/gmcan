import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class NoticiaService{
    public url: string;
    JWT_TOKEN = 'JWT_TOKEN';

  languagelocal;
  constructor(public http: HttpClient){
    this.url = GLOBAL.url;
    this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
  }
    
  getNoticias(): any{
    let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'noticia/get-noticia',{headers:headers});
    }else{
      return this.http.get(this.url+'noticia/get-noticia-en',{headers:headers});
    }
  }
    
  getNoticia(idNoticia){
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'noticia/get-noticia/'+idNoticia,{headers:headers});
    }else{
      return this.http.get(this.url+'noticia/get-noticia-en/'+idNoticia,{headers:headers});
    }
  }

  getNoticiaTipo(idTipo): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'noticia/get-noticiatipo/'+idTipo,{headers:headers});
    }else{
      return this.http.get(this.url+'noticia/get-noticiatipo-en/'+idTipo,{headers:headers});
    }
  }

  getNoticiaUsuario(idUsuario): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'noticia/get-noticiausuario/'+idUsuario,{headers:headers});
    }else{
      return this.http.get(this.url+'noticia/get-noticiausuario-en/'+idUsuario,{headers:headers});
    }
  }

  addNews(noticia):any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.post(this.url+'noticia/post-noticia',noticia,{headers});
  }  

  uploadNoticiaFoto(fileData, id){
    const formData = new FormData();
    formData.append('foto', fileData, fileData.name); 
    console.log(formData.get('foto'));
    let headers = new HttpHeaders ({
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.put(this.url+'noticia/upload-noticia-file/'+id, formData, {headers});
  }

  getNoticiaFull(idNoticia): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
    });
    return this.http.get(this.url+'noticia/get-noticiafull/'+idNoticia,{headers:headers});
  }

  updateNoticia(noticia):any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.put(this.url+'noticia/update-noticia', noticia,{headers});
  }

  deleteNoticia(idNoticia):any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.delete(this.url+'noticia/delete-noticia/'+idNoticia,{headers});
  }

}