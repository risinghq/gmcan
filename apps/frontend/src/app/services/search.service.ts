import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class SearchService{
    public url: string;

	languagelocal;
	constructor(public http: HttpClient){
        this.url = GLOBAL.url;
        this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
    }
    
    searchPublicaciones(nombre,id): any{
        let body = {"titulo":nombre,"tipoPublicacion_idTipoPublicacion":id};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.post(this.url+'publicacion/search-publicaciones',body,{headers});
    }
    searchAutores(nombre): any{
        let body = {"nombre":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.post(this.url+'autor/search-autores',body,{headers});
    }
    searchUsuarios(nombre): any{
        let body = {"nombre":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.post(this.url+'usuario/search-usuarios',body,{headers});
    }
    searchEventos(nombre): any{
        let body = {"nombre":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.post(this.url+'evento/search-eventos',body,{headers});
    }
    searchCiudades(nombre): any{
        let body = {"nombre":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        if(this.languagelocal=="es"){
            return this.http.post(this.url+'ciudad/search-ciudades',body,{headers});
        }else{
            return this.http.post(this.url+'ciudad/search-ciudades-en',body,{headers});
        } 
    }
    searchPaises(nombre): any{
        let body = {"nombre":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.post(this.url+'pais/search-paises',body,{headers});
    }
    searchTipoTesis(nombre): any{
        let body = {"nombre":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        if(this.languagelocal=="es"){
            return this.http.post(this.url+'tipotesis/search-tipotesis',body,{headers});
        }else{
            return this.http.post(this.url+'tipotesis/search-tipotesis-en',body,{headers});
        } 
    }
    searchProyectos(nombre, estado): any{
        let body = {"nombre":nombre, "estado":estado};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
        });
        if(this.languagelocal=="es"){
            return this.http.post(this.url+'proyecto/search-proyecto',body,{headers});
        }else{
            return this.http.post(this.url+'proyecto/search-proyecto-en',body,{headers});
        } 
    }
    searchLineasInvestigacion(nombre): any{
        let body = {"nombre":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        if(this.languagelocal=="es"){
            return this.http.post(this.url+'lineasinvestigacion/search-lineasinvestigacion',body,{headers});
        }else{
            return this.http.post(this.url+'lineasinvestigacion/search-lineasinvestigacion-en',body,{headers});
        } 
    }

    searchUniversidad(nombre): any{
        let body = {"nombre":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        if(this.languagelocal=="es"){
            return this.http.post(this.url+'universidad/search-universidad',body,{headers});
        }else{
            return this.http.post(this.url+'universidad/search-universidad-en',body,{headers});
        } 
    }

    searchRevista(nombre): any{
        let body = {"nombre":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.post(this.url+'revista/search-revistas',body,{headers});
    }

    searchPublicacionesGlobal(nombre): any{
        let body = {"titulo":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        if(this.languagelocal=="es"){
            return this.http.post(this.url+'publicacion/search-publicaciones-global',body,{headers});
        }else{
            return this.http.post(this.url+'publicacion/search-publicaciones-global-en',body,{headers});
        } 
    }

    searchProyectosGlobal(nombre): any{
        let body = {"nombre":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        if(this.languagelocal=="es"){
            return this.http.post(this.url+'proyecto/search-proyecto-global',body,{headers});
        }else{
            return this.http.post(this.url+'proyecto/search-proyecto-global-en',body,{headers});
        } 
    }

    searchNoticiasGlobal(nombre): any{
        let body = {"nombre":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        if(this.languagelocal=="es"){
            return this.http.post(this.url+'noticia/search-noticia-global',body,{headers});
        }else{
            return this.http.post(this.url+'noticia/search-noticia-global-en',body,{headers});
        } 
    }

    searchTipoNoticiasGlobal(nombre): any{
        let body = {"nombre":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        if(this.languagelocal=="es"){
            return this.http.post(this.url+'tipo-noticia/search-tiponoticia-global',body,{headers});
        }else{
            return this.http.post(this.url+'tipo-noticia/search-tiponoticia-global-en',body,{headers});
        } 
    }

    searchUsuariosGlobal(nombre): any{
        let body = {"nombre":nombre};
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.post(this.url+'usuario/search-usuarios-global',body,{headers});
    }
}
