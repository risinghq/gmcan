import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class SearchService {
  http = inject(HttpClient);
  private _session = inject(SessionService);

  public url: string;

  private get languagelocal(): string {
    return this._session.getLanguageData<{ locale?: string }>()?.locale ?? "es";
  }

  constructor() {
    this.url = GLOBAL.url;
  }

  searchPublicaciones(nombre: string, id: number): any {
    let body = { titulo: nombre, tipoPublicacion_idTipoPublicacion: id };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "publicacion/search-publicaciones", body, { headers });
  }
  searchUsuarios(nombre: string): any {
    let body = { nombre: nombre };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "usuario/search-usuarios", body, { headers });
  }
  searchEventos(nombre: string): any {
    let body = { nombre: nombre };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "evento/search-eventos", body, { headers });
  }
  searchCiudades(nombre: string): any {
    let body = { nombre: nombre };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.post(this.url + "ciudad/search-ciudades", body, { headers });
    } else {
      return this.http.post(this.url + "ciudad/search-ciudades-en", body, { headers });
    }
  }
  searchPaises(nombre: string): any {
    let body = { nombre: nombre };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "pais/search-paises", body, { headers });
  }
  searchTipoTesis(nombre: string): any {
    let body = { nombre: nombre };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.post(this.url + "tipotesis/search-tipotesis", body, { headers });
    } else {
      return this.http.post(this.url + "tipotesis/search-tipotesis-en", body, { headers });
    }
  }
  searchProyectos(nombre: string, estado: number): any {
    let body = { nombre: nombre, codigo: nombre, estado: estado };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.post(this.url + "proyecto/search-proyecto", body, { headers });
    } else {
      return this.http.post(this.url + "proyecto/search-proyecto-en", body, { headers });
    }
  }
  searchLineasInvestigacion(nombre: string): any {
    let body = { nombre: nombre };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.post(this.url + "lineasinvestigacion/search-lineasinvestigacion", body, {
        headers,
      });
    } else {
      return this.http.post(this.url + "lineasinvestigacion/search-lineasinvestigacion-en", body, {
        headers,
      });
    }
  }

  searchUniversidad(nombre: string): any {
    let body = { nombre: nombre };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.post(this.url + "universidad/search-universidad", body, { headers });
    } else {
      return this.http.post(this.url + "universidad/search-universidad-en", body, { headers });
    }
  }

  searchRevista(nombre: string): any {
    let body = { nombre: nombre };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "revista/search-revistas", body, { headers });
  }

  searchPublicacionesGlobal(nombre: string): any {
    let body = { titulo: nombre };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.post(this.url + "publicacion/search-publicaciones-global", body, {
        headers,
      });
    } else {
      return this.http.post(this.url + "publicacion/search-publicaciones-global-en", body, {
        headers,
      });
    }
  }

  searchProyectosGlobal(nombre: string): any {
    let body = { nombre: nombre };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.post(this.url + "proyecto/search-proyecto-global", body, { headers });
    } else {
      return this.http.post(this.url + "proyecto/search-proyecto-global-en", body, { headers });
    }
  }

  searchNoticiasGlobal(nombre: string): any {
    let body = { nombre: nombre };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.post(this.url + "noticia/search-noticia-global", body, { headers });
    } else {
      return this.http.post(this.url + "noticia/search-noticia-global-en", body, { headers });
    }
  }

  searchTipoNoticiasGlobal(nombre: string): any {
    let body = { nombre: nombre };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.post(this.url + "tipo-noticia/search-tiponoticia-global", body, { headers });
    } else {
      return this.http.post(this.url + "tipo-noticia/search-tiponoticia-global-en", body, {
        headers,
      });
    }
  }

  searchUsuariosGlobal(nombre: string): any {
    let body = { nombre: nombre };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "usuario/search-usuarios-global", body, { headers });
  }
}
