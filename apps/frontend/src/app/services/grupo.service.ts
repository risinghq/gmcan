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
    JWT_TOKEN = 'JWT_TOKEN';

	languagelocal;
    constructor(public http: HttpClient){
      this.url = GLOBAL.url;
      if(JSON.parse(localStorage.getItem("language"))){
        this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
      }else{
        this.languagelocal="es";
      }
    }
    
    getGrupoInfo(): any{
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
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.get(this.url+'grupo/get-image-grupo/'+imageFile,{responseType: 'text'});;
    }

    getFacilidadesRecursos():any{
        let headers = new HttpHeaders ({
            'Content-Type':'application/json',
            'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
		});
        return this.http.get(this.url+'grupo/get-grupo-facilidades',{headers:headers});
    }

    updateRecursos(facilidades):any{
        let headers = new HttpHeaders ({
            'Content-Type':'application/json',
            'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
		});
        return this.http.put(this.url+'grupo/update-grupo-facilidades',facilidades,{headers:headers});
    }

    uploadFacilidadesFoto(fileData, id):any{
        const formData = new FormData();
        formData.append('foto', fileData, fileData.name); 
        let headers = new HttpHeaders ({
          'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
          });
        return this.http.put(this.url+'grupo/upload-image-facilidades/'+id, formData, {headers});
    }

    getTrabajosFuturos():any{
        let headers = new HttpHeaders ({
            'Content-Type':'application/json',
            'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
		});
        return this.http.get(this.url+'grupo/get-grupo-trabajosfuturos',{headers:headers});
    }

    updateTrabajosFuturos(trabajos):any{
        let headers = new HttpHeaders ({
            'Content-Type':'application/json',
            'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
		});
        return this.http.put(this.url+'grupo/update-grupo-trabajosfuturos',trabajos,{headers:headers});
    }

    uploadHeaderLogo(fileData, id):any{
        const formData = new FormData();
        formData.append('foto', fileData, fileData.name); 
        let headers = new HttpHeaders ({
          'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
          });
        return this.http.put(this.url+'grupo/upload-grupo-header/'+id, formData, {headers});
    }

    uploadFooterLogo(fileData, id):any{
        const formData = new FormData();
        formData.append('foto', fileData, fileData.name); 
        let headers = new HttpHeaders ({
          'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
          });
        return this.http.put(this.url+'grupo/upload-grupo-footer/'+id, formData, {headers});
    }

    updateSeccionInfo(grupo):any{
        let headers = new HttpHeaders ({
            'Content-Type':'application/json',
            'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
		});
        return this.http.put(this.url+'grupo/update-grupo-info',grupo,{headers:headers});
    }

    updateSeccionPresentacion(grupo):any{
        let headers = new HttpHeaders ({
            'Content-Type':'application/json',
            'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
		});
        return this.http.put(this.url+'grupo/update-grupo-seccionpresentacion',grupo,{headers:headers});
    }

    updateSeccionPublicaciones(seccionpublicaciones):any{
        let headers = new HttpHeaders ({
            'Content-Type':'application/json',
            'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
		});
        return this.http.put(this.url+'grupo/update-grupo-seccionpublicaciones',seccionpublicaciones,{headers:headers});
    }

    updateSeccionProyectos(seccionproyectos):any{
        let headers = new HttpHeaders ({
            'Content-Type':'application/json',
            'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
		});
        return this.http.put(this.url+'grupo/update-grupo-seccionproyectos',seccionproyectos,{headers:headers});
    }

}