import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { catchError, of, share } from "rxjs";

import type { LookupData } from "../models/lookup";
import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class LookupService {
  private http = inject(HttpClient);

  private readonly lookup$ = this.http.get<LookupData>(GLOBAL.api("lookup")).pipe(
    share(),
    catchError(() => of(this.getEmptyLookup())),
  );

  private readonly data = toSignal(this.lookup$, { initialValue: this.getEmptyLookup() });

  private getEmptyLookup(): LookupData {
    return {
      memberTypes: [],
      publicationKinds: [],
      thesisKinds: [],
      newsKinds: [],
      fundingSources: [],
      currencies: [],
      roles: [],
      genders: [],
      prefixes: [],
      universities: [],
      journals: [],
      events: [],
      locales: { supported: ["es", "en"], default: "es" },
    };
  }

  memberTypes() {
    return this.data().memberTypes;
  }

  publicationKinds() {
    return this.data().publicationKinds;
  }

  thesisKinds() {
    return this.data().thesisKinds;
  }

  newsKinds() {
    return this.data().newsKinds;
  }

  fundingSources() {
    return this.data().fundingSources;
  }

  currencies() {
    return this.data().currencies;
  }

  roles() {
    return this.data().roles;
  }

  genders() {
    return this.data().genders;
  }

  prefixes() {
    return this.data().prefixes;
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

  locales() {
    return this.data().locales;
  }
}
