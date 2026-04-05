import { Injectable, inject } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

@Injectable({
  providedIn: "root",
})
export class PreviousPageService {
  private _session = inject(SessionService);

  getPreviousPage(param: string): string {
    const locale = this._session.languageCode ?? "es";
    if (locale == "es") {
      if (param && param.includes("search")) {
        return "Resultados de Búsqueda";
      }
      switch (param) {
        case "home/about-us/about":
          return "¿Quiénes Somos?";
        case "home/about-us/lines-investigation":
          return "Líneas de investigación";
        case "home/about-us/methods":
          return "Métodos";
        case "home/about-us/facilities-resources":
          return "Facilidades y recursos";
        case "home/about-us/works":
          return "Trabajos futuros";
        case "home/publications":
          return "Publicaciones";
        case "home/members":
          return "Miembros";
        case "home/projects":
          return "Proyectos";
        case "home/news":
          return "Noticias";
        case "":
          return "Inicio";
        default:
          return "Inicio";
      }
    } else {
      if (param && param.includes("search")) {
        return "Search Results";
      }
      switch (param) {
        case "home/about-us/about":
          return "Who are we?";
        case "home/about-us/lines-investigation":
          return "Lines of investigation";
        case "home/about-us/methods":
          return "Methods";
        case "home/about-us/facilities-resources":
          return "Facilities and Resources";
        case "home/about-us/works":
          return "Future Works";
        case "home/publications":
          return "Publications";
        case "home/members":
          return "Members";
        case "home/projects":
          return "Projects";
        case "home/news":
          return "News";
        case "":
          return "Home";
        default:
          return "Home";
      }
    }
  }
}
