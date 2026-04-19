import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { catchError, of, share } from "rxjs";

import { GENEROS, MONEDAS, PREFIJOS } from "../constants/lookups";
import type { LookupData } from "../models/lookup";
import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class LookupService {
  private http = inject(HttpClient);

  private readonly lookup$ = this.http.get<LookupData>(`${GLOBAL.url}lookup`).pipe(
    share(),
    catchError(() => of(this.getEmptyLookup())),
  );

  private readonly data = toSignal(this.lookup$, { initialValue: this.getEmptyLookup() });

  private getEmptyLookup(): LookupData {
    return {
      generos: [],
      prefijos: [],
      tiposMiembro: [],
      tiposPublicacion: [],
      tiposTesis: [],
      monedas: [],
      tiposNoticia: [],
      tiposUsuario: [],
      fuentesFinanciamiento: [],
      universidades: [],
      revistas: [],
      eventos: [],
    };
  }

  generos() {
    return GENEROS;
  }

  prefijos() {
    return PREFIJOS;
  }

  monedas() {
    return MONEDAS;
  }

  tiposUsuario() {
    return [];
  }

  tiposMiembro() {
    return this.data().tiposMiembro;
  }

  tiposPublicacion() {
    return this.data().tiposPublicacion;
  }

  tiposTesis() {
    return this.data().tiposTesis;
  }

  tiposNoticia() {
    return this.data().tiposNoticia;
  }

  fuentesFinanciamiento() {
    return this.data().fuentesFinanciamiento;
  }

  universidades() {
    return this.data().universidades;
  }

  revistas() {
    return this.data().revistas;
  }

  eventos() {
    return this.data().eventos;
  }
}
