import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { TipoNoticia } from "../models/tiponoticia";
import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class AdminTipoNoticiaService {
  private http = inject(HttpClient);

  addCategory(category: TipoNoticia): Observable<{ status: number }> {
    return this.http.post<{ status: number }>(`${GLOBAL.url}tipo-noticia/post-tiponoticia`, category);
  }

  updateCategory(category: TipoNoticia): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}tipo-noticia/update-tiponoticia`, category);
  }

  deleteCategory(idCategory: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}tipo-noticia/delete-tiponoticia/${idCategory}`);
  }
}
