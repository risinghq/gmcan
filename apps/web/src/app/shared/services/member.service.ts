import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type {
  AdminMember,
  AuthorCandidate,
  MemberCreate,
  MemberProfileWrite,
  MemberWrite,
} from "@gmcan/contracts/admin";
import type { MemberTypeCode, PublicMember, PublicMemberProfile } from "@gmcan/contracts/public";
import { Observable } from "rxjs";

import type { AdminMemberListItem } from "../models/admin-list";
import type { MemberGroup, MemberPublishability } from "../models/member";
import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class MemberService {
  private http = inject(HttpClient);

  listMembers(): Observable<PublicMember[]> {
    return this.http.get<PublicMember[]>(GLOBAL.api("members"));
  }

  getMemberProfile(id: number): Observable<PublicMemberProfile> {
    return this.http.get<PublicMemberProfile>(GLOBAL.api(`members/${id}`));
  }

  listAdminMembers(params?: { isActive?: number; memberTypeCode?: MemberTypeCode }): Observable<AdminMemberListItem[]> {
    return this.http.get<AdminMemberListItem[]>(GLOBAL.admin("members"), {
      params: params as Record<string, string | number>,
    });
  }

  getAdminMember(id: number): Observable<AdminMember> {
    return this.http.get<AdminMember>(GLOBAL.admin(`members/${id}`));
  }

  createMember(body: MemberCreate): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(GLOBAL.admin("members"), body);
  }

  updateMember(id: number, body: MemberWrite): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`members/${id}`), body);
  }

  getOwnProfile(): Observable<AdminMember> {
    return this.http.get<AdminMember>(GLOBAL.admin("account/profile"));
  }

  updateOwnProfile(body: MemberProfileWrite): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin("account/profile"), body);
  }

  uploadOwnPhoto(file: File): Observable<{ status: number }> {
    const form = new FormData();
    form.set("file", file);
    return this.http.put<{ status: number }>(GLOBAL.admin("account/profile/photo"), form);
  }

  deleteMember(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`members/${id}`));
  }

  searchAuthors(q: string): Observable<AuthorCandidate[]> {
    return this.http.get<AuthorCandidate[]>(GLOBAL.admin("members/authors/search"), { params: { q } });
  }

  getMemberGroups(id: number): Observable<MemberGroup[]> {
    return this.http.get<MemberGroup[]>(GLOBAL.admin(`members/${id}/groups`));
  }

  addMemberToGroup(id: number, groupId: number): Observable<{ status: number }> {
    return this.http.post<{ status: number }>(GLOBAL.admin(`members/${id}/groups`), { groupId });
  }

  removeMemberFromGroup(id: number, groupId: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`members/${id}/groups/${groupId}`));
  }

  verifyEmail(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(GLOBAL.admin("members/exists/email"), { params: { email } });
  }

  getMemberPublishability(id: number): Observable<MemberPublishability> {
    return this.http.get<MemberPublishability>(GLOBAL.admin(`members/${id}/publishability`));
  }

  getOwnPublishability(): Observable<MemberPublishability> {
    return this.http.get<MemberPublishability>(GLOBAL.admin("account/profile/publishability"));
  }
}
