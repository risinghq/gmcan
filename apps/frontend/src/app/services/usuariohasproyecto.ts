import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class UsuarioHasProyectoService{
    public url: string;

	constructor(public http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    getUsuarioHasProyectos(idProyecto): any{
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.get(this.url+'usuariohasproyecto/get-usuariohasproyecto/'+idProyecto,{headers:headers});
    }

    getUsuarioHasProyecto(dni): any{
      let headers = new HttpHeaders ({
    'Content-Type':'application/json'
  });
      return this.http.get(this.url+'usuariohasproyecto/get-usuariohasproyectos/'+dni,{headers:headers});
  }

}