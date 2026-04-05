import { HttpClient } from "@angular/common/http";
import { Injectable, computed, inject, signal } from "@angular/core";
import { Observable, map, tap } from "rxjs";

import type { LookupData } from "../models/lookup";
import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class LookupService {
  private http = inject(HttpClient);
  private _data = signal<LookupData | null>(null);

  readonly generos = computed(() => this._data()?.generos ?? []);
  readonly prefijos = computed(() => this._data()?.prefijos ?? []);
  readonly tiposMiembro = computed(() => this._data()?.tiposMiembro ?? []);
  readonly tiposPublicacion = computed(() => this._data()?.tiposPublicacion ?? []);
  readonly tiposTesis = computed(() => this._data()?.tiposTesis ?? []);
  readonly monedas = computed(() => this._data()?.monedas ?? []);
  readonly tiposNoticia = computed(() => this._data()?.tiposNoticia ?? []);
  readonly tiposUsuario = computed(() => this._data()?.tiposUsuario ?? []);
  readonly fuentesFinanciamiento = computed(() => this._data()?.fuentesFinanciamiento ?? []);
  readonly universidades = computed(() => this._data()?.universidades ?? []);
  readonly revistas = computed(() => this._data()?.revistas ?? []);
  readonly eventos = computed(() => this._data()?.eventos ?? []);

  load(): Observable<void> {
    return this.http.get<LookupData>(`${GLOBAL.url}lookup`).pipe(
      tap((data) => this._data.set(data)),
      map(() => undefined),
    );
  }
}
