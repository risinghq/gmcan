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
                return '<span>Noticias </span><span class="grey-title">- Agregar Noticia</span'
            default:
                break;
        }
        if(splitted[0]=='/dashboard/edit-n'){
            return '<span>Noticias </span><span class="grey-title">- Detalle de Noticia</span';
        }
    }

}