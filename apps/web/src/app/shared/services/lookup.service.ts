import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import type { PublicMember } from "@gmcan/contracts/public";
import { catchError, defer, firstValueFrom, of } from "rxjs";

import type { LookupData } from "../models/lookup";
import { personName } from "../utils/person-name";
import { GLOBAL } from "./global";

// Pages and resolvers read lookups synchronously, so the app initializer awaits load() before the first route renders.
@Injectable({ providedIn: "root" })
export class LookupService {
  private http = inject(HttpClient);

  private readonly data = signal<LookupData>(this.getEmptyLookup());

  // The build extracts routes with no request, so no API URL exists and GLOBAL.api throws. defer turns that
  // throw into the same empty lookup as a failed request.
  async load(): Promise<void> {
    const data = await firstValueFrom(
      defer(() => this.http.get<LookupData>(GLOBAL.api("lookup"))).pipe(catchError(() => of(this.getEmptyLookup()))),
    );
    this.data.set(data);
  }

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

  /** A member's public name. The "none" and "bach" prefixes print nothing. */
  memberName(member: Pick<PublicMember, "prefixCode" | "firstName" | "lastName" | "maternalName">): string {
    const shown = member.prefixCode !== "none" && member.prefixCode !== "bach";
    const title = shown ? this.data().prefixes.find((item) => item.code === member.prefixCode)?.label : undefined;
    return title ? `${title} ${personName(member)}` : personName(member);
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
