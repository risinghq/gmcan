import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
  })
export class PreviousPageService{
    language=JSON.parse(localStorage.getItem("language"));
    getPreviousPage(param){
        if(this.language.locale=="es"){
            switch (param) {
                case "about-us":
                    return "Sobre Nosotros";
                case "publications":
                    return "Publicaciones";
                case "members":
                    return "Miembros";
                case "projects":
                    return "Proyectos";
                case "":
                    return "Inicio";
                default:
                    return "Inicio";
            }
        }else{
            switch (param) {
                case "about-us":
                    return "About Us";
                case "publications":
                    return "Publications";
                case "members":
                    return "Members";
                case "projects":
                    return "Projects";
                case "":
                    return "Home";
                default:
                    return "Home";
            }
        }

    }

}