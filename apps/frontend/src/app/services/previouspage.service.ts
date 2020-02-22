import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
  })
export class PreviousPageService{
    
    getPreviousPage(param){
        switch (param) {
            case "about-us":
                return "Sobre Nosotros";
            case "publications":
                return "Publicaciones";
            case "members":
                return "Miembros";
            case "":
                return "Inicio";
            default:
                return "Inicio";
        }

    }

}