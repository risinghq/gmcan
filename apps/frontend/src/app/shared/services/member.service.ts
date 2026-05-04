import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { AuthorSearchResult } from "../models/author";
import type { Member, MemberFull, MemberProfile } from "../models/member";
import { GLOBAL } from "./global";

export interface MemberCreateBody {
  dni: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  maternalName?: string;
  birthDate?: string;
  bio?: string;
  status: number;
  roleId: number;
  memberTypeId: number;
  prefixId?: number;
  genderId?: number;
}

export interface MemberUpdateBody {
  email: string;
  firstName: string;
  lastName: string;
  maternalName?: string;
  birthDate?: string;
  bio?: string;
  status: number;
  roleId: number;
  memberTypeId: number;
  prefixId?: number;
  genderId?: number;
}

@Injectable({ providedIn: "root" })
export class MemberService {
  private http = inject(HttpClient);

  // Public
  listMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(`${GLOBAL.url}api/members`);
  }

  getMemberProfile(id: number): Observable<MemberProfile> {
    return this.http.get<MemberProfile>(`${GLOBAL.url}api/members/${id}`);
  }

  // Admin
  listAdminMembers(params?: { status?: number; memberTypeId?: number }): Observable<Member[]> {
    return this.http.get<Member[]>(`${GLOBAL.url}admin/members`, { params: params as Record<string, string | number> });
  }

  getMemberFull(id: number): Observable<MemberFull> {
    return this.http.get<MemberFull>(`${GLOBAL.url}admin/members/${id}`);
  }

  createMember(body: MemberCreateBody): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${GLOBAL.url}admin/members`, body);
  }

  updateMember(id: number, body: MemberUpdateBody): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/members/${id}`, body);
  }

  deleteMember(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/members/${id}`);
  }

  uploadPhoto(id: number, file: File): Observable<{ status: number }> {
    const formData = new FormData();
    formData.append("file", file, file.name);
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/members/${id}/photo`, formData);
  }

  deletePhoto(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/members/${id}/photo`);
  }

  searchAuthors(q: string): Observable<AuthorSearchResult[]> {
    return this.http.get<AuthorSearchResult[]>(`${GLOBAL.url}admin/members/authors/search`, { params: { q } });
  }

  getMemberGroups(id: number): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${GLOBAL.url}admin/members/${id}/groups`);
  }

  addMemberToGroup(id: number, groupId: number): Observable<{ status: number }> {
    return this.http.post<{ status: number }>(`${GLOBAL.url}admin/members/${id}/groups`, { groupId });
  }

  removeMemberFromGroup(id: number, groupId: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/members/${id}/groups/${groupId}`);
  }

  verifyEmail(email: string): Observable<unknown> {
    return this.http.get(`${GLOBAL.url}admin/members`, { params: { email } });
  }

  verifyDni(dni: string): Observable<unknown> {
    return this.http.get(`${GLOBAL.url}admin/members`, { params: { dni } });
  }
}
