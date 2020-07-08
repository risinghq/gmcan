import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class UsuarioService{
    public url: string;
    JWT_TOKEN = 'JWT_TOKEN';

	languagelocal;
	constructor(public http: HttpClient){
    this.url = GLOBAL.url;
    this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
  }
    
  getUsuario(): any{
    let headers = new HttpHeaders ({
		  'Content-Type':'application/json'
	  });
    return this.http.get(this.url+'usuario/get-usuario-name',{headers:headers});
  }

  getUser(idUsuario): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'usuario/get-usuario/'+idUsuario,{headers:headers});
    }else{
      return this.http.get(this.url+'usuario/get-usuario-en/'+idUsuario,{headers:headers});
    } 
  }

  getUsuarios():any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json'
    });
    if(this.languagelocal=="es"){
      return this.http.get(this.url+'usuario/get-usuario',{headers:headers});
    }else{
      return this.http.get(this.url+'usuario/get-usuario-en',{headers:headers});
    } 
  }

  login(user):any{
    let body = {"correo":user.correo, "password":user.password};
    let headers = new HttpHeaders ({
		  'Content-Type':'application/json'
	  });
    return this.http.post(this.url+'usuario/login',body,{headers});
  }  

  changePassword(user): any{
    let body = {"password":user.password,"correo":user.correo};
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization':'Bearer '+user.token
	  });
    return this.http.put(this.url+'usuario/update-password',body,{headers});
  }
  checkStatus(user): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization':'Bearer '+user.token
	  });
    return this.http.get(this.url+'usuario/check-res/'+user.correo,{headers});
  }

  getUserLogged(){
    return JSON.parse(localStorage.getItem("user"));
  }

  logout(){
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  getUsersActive(id): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization':'Bearer '+localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.get(this.url+'usuario/get-usuario-active/'+id,{headers});
  }

  getFullUser(DNI): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization':'Bearer '+localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.get(this.url+'usuario/get-usuario-full/'+DNI,{headers});
  }

  addUser(user): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization':'Bearer '+localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.post(this.url+'usuario/post-usuario',user,{headers});
  }

  updateUser(user): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization':'Bearer '+localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.put(this.url+'usuario/update-usuario',user,{headers});
  }

  verifyUser(user): any{
    let headers = new HttpHeaders ({
      'Content-Type':'application/json',
      'Authorization':'Bearer '+localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.post(this.url+'usuario/verify-email',user,{headers});
  }

  uploadUsuarioFoto(fileData, id){
    const formData = new FormData();
    formData.append('image', fileData, fileData.name); 
    let headers = new HttpHeaders ({
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.put(this.url+'usuario/upload-usuario-file/'+id, formData, {headers});
  }

  deleteUsuario(miembro):any{
    let headers = new HttpHeaders ({
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.delete(this.url+'usuario/delete-usuario/'+miembro.DNI, {headers});
  }

  deleteImage(idImage):any{
    let headers = new HttpHeaders ({
      'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
	  });
    return this.http.delete(this.url+'usuario/erase-image/'+idImage, {headers});
  }

}