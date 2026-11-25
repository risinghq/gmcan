import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Translations } from "@gmcan/contracts/admin";
import { Observable } from "rxjs";

import { GLOBAL } from "./global";

export interface EventItem {
  id: number;
  name: string;
  city: string | null;
  country: string | null;
}

export interface EventTranslation {
  name: string;
  city: string | null;
  country: string | null;
}

export interface EventWrite {
  translations: Translations<EventTranslation>;
}

/** `GET /admin/events/:id`. A locale without a city or country omits the key. */
export interface AdminEvent {
  id: number;
  translations: Translations<{ name: string; city?: string; country?: string }>;
}

@Injectable({ providedIn: "root" })
export class EventService {
  private http = inject(HttpClient);

  list(): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(GLOBAL.api("events"));
  }

  listAdmin(): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(GLOBAL.admin("events"));
  }

  get(id: number): Observable<AdminEvent> {
    return this.http.get<AdminEvent>(GLOBAL.admin(`events/${id}`));
  }

  create(body: EventWrite): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(GLOBAL.admin("events"), body);
  }

  update(id: number, body: EventWrite): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`events/${id}`), body);
  }

  delete(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`events/${id}`));
  }
}
