import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import { GLOBAL } from "./global";

export interface EventItem {
  id: number;
  name: string;
  city: string | null;
  country: string | null;
}

export interface EventBody {
  name: string;
  city?: string;
  country?: string;
}

@Injectable({ providedIn: "root" })
export class EventService {
  private http = inject(HttpClient);

  // Public
  list(): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(`${GLOBAL.url}api/events`);
  }

  // Admin
  listAdmin(): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(`${GLOBAL.url}admin/events`);
  }

  get(id: number): Observable<EventItem> {
    return this.http.get<EventItem>(`${GLOBAL.url}admin/events/${id}`);
  }

  create(body: EventBody): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${GLOBAL.url}admin/events`, body);
  }

  update(id: number, body: EventBody): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/events/${id}`, body);
  }

  delete(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/events/${id}`);
  }
}
