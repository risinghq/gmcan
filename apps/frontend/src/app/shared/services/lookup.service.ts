import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { firstValueFrom, Observable, tap } from "rxjs";

import type { LookupData } from "../models/lookup";
import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class LookupService {
  private http = inject(HttpClient);
  private _data = signal<LookupData | null>(null);
  private _loaded = false;

  private _ensureLoaded(): void {
    if (!this._loaded) {
      this._loaded = true;
      firstValueFrom(this.load());
    }
  }

  generos() {
    this._ensureLoaded();
    return this._data()?.generos ?? [];
  }

  prefijos() {
    this._ensureLoaded();
    return this._data()?.prefijos ?? [];
  }

  tiposMiembro() {
    this._ensureLoaded();
    return this._data()?.tiposMiembro ?? [];
  }

  tiposPublicacion() {
    this._ensureLoaded();
    return this._data()?.tiposPublicacion ?? [];
  }

  tiposTesis() {
    this._ensureLoaded();
    return this._data()?.tiposTesis ?? [];
  }

  monedas() {
    this._ensureLoaded();
    return this._data()?.monedas ?? [];
  }

  tiposNoticia() {
    this._ensureLoaded();
    return this._data()?.tiposNoticia ?? [];
  }

  tiposUsuario() {
    this._ensureLoaded();
    return this._data()?.tiposUsuario ?? [];
  }

  fuentesFinanciamiento() {
    this._ensureLoaded();
    return this._data()?.fuentesFinanciamiento ?? [];
  }

  universidades() {
    this._ensureLoaded();
    return this._data()?.universidades ?? [];
  }

  revistas() {
    this._ensureLoaded();
    return this._data()?.revistas ?? [];
  }

  eventos() {
    this._ensureLoaded();
    return this._data()?.eventos ?? [];
  }

  load(): Observable<LookupData> {
    return this.http.get<LookupData>(`${GLOBAL.url}lookup`).pipe(
      tap((data) => this._data.set(data)),
      tap(() => {
        this._loaded = true;
      }),
    );
  }
}
