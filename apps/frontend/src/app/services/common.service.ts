import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class CommonService{
    public url: string;

    languagelocal;
    constructor(){}

    defineTitle(value){
        let splitted=value.split('ews/',2);
        switch (value) {
            case '/dashboard':
                return '<span>Dashboard</span>'
            case '/dashboard/noticias':
                return '<span>Noticias</span>'
            case '/dashboard/add-news':
                return '<span>Noticias </span><span class="grey-title">- Agregar Noticia</span>'
            case '/dashboard/add-category':
                return '<span>Noticias </span><span class="grey-title">- Agregar Categoría</span>'
            case '/dashboard/miembros-activos':
                return '<span>Miembros Activos</span>'
            case '/dashboard/miembros-antiguos':
                return '<span>Miembros Antiguos</span>'
            case '/dashboard/add-member':
                return '<span>Miembros Activos </span><span class="grey-title">- Agregar miembro al grupo</span>'
            case '/dashboard/perfil':
                return '<span>Mi información personal</span>'
            default:
                break;
        }
        if(splitted[0]=='/dashboard/edit-n'){
            return '<span>Noticias </span><span class="grey-title">- Detalle de Noticia</span>';
        }
        splitted=value.split('member/',2);
        if(splitted[0]=='/dashboard/edit-'){
            if(localStorage.getItem("miembroEdit")){
                if(localStorage.getItem("active-member")=='1'){
                    return '<span>Miembros Activos </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("miembroEdit"))+'</span>';
                }else{
                    return '<span>Miembros Antiguos </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("miembroEdit"))+'</span>';
                }
            }            
        }
        splitted=value.split('gory/',2);
        if(splitted[0]=='/dashboard/edit-cate'){
            return '<span>Noticias </span><span class="grey-title">- Categoria: '+JSON.parse(localStorage.getItem("categoryEdit"))+'</span>';
        }
    }

    setEndSession(value){
        localStorage.setItem("sessionEnd", value);
    }

    reset;

    setReset(value){
        this.reset=value;
    }

    getReset(){
        return this.reset;
    }

}