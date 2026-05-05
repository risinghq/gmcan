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

  private readonly lookup$ = this.http.get<LookupData>(`${GLOBAL.url}api/lookup`).pipe(
    share(),
    catchError(() => of(this.getEmptyLookup())),
  );

  private readonly data = toSignal(this.lookup$, { initialValue: this.getEmptyLookup() });

  private getEmptyLookup(): LookupData {
    return {
      memberTypes: [],
      publicationTypes: [],
      thesisTypes: [],
      newsTypes: [],
      fundingSources: [],
      universities: [],
      journals: [],
      events: [],
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

  memberTypes() {
    return this.data().memberTypes;
  }

  publicationTypes() {
    return this.data().publicationTypes;
  }

  thesisTypes() {
    return this.data().thesisTypes;
  }

  newsTypes() {
    return this.data().newsTypes;
  }

  fundingSources() {
    return this.data().fundingSources;
  }

  universities() {
    return this.data().universities;
  }

  journals() {
    return this.data().journals;
  }

  events() {
    return this.data().events;
  }
}
