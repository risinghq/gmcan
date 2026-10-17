import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { PublicMember } from "@gmcan/contracts/public";
import { Observable } from "rxjs";

import type { AdminMemberListItem } from "../models/admin-list";
import type { AuthorSearchResult } from "../models/author";
import type { MemberFull, MemberGroup, MemberProfile, MemberPublishability } from "../models/member";
import { GLOBAL } from "./global";

export interface MemberCreateBody {
  dni: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  maternalName?: string;
  birthDate?: string;
  isActive: number;
  roleCode: "administrator" | "researcher" | "visitor";
  memberTypeCode: "researcher" | "phd_student" | "master_student" | "undergraduate_student" | "collaborator";
  prefixCode?: "dr" | "dra" | "mg" | "lic" | "bach" | "ing" | "none" | null;
  genderCode?: "male" | "female" | null;
  translation?: { locale: string; bio: string };
}

export interface MemberUpdateBody {
  email?: string;
  firstName?: string;
  lastName?: string;
  maternalName?: string;
  birthDate?: string;
  isActive?: number;
  roleCode?: "administrator" | "researcher" | "visitor";
  memberTypeCode?: "researcher" | "phd_student" | "master_student" | "undergraduate_student" | "collaborator";
  prefixCode?: "dr" | "dra" | "mg" | "lic" | "bach" | "ing" | "none" | null;
  genderCode?: "male" | "female" | null;
  translation?: { locale: string; bio: string };
}

@Injectable({ providedIn: "root" })
export class MemberService {
  private http = inject(HttpClient);

  listMembers(): Observable<PublicMember[]> {
    return this.http.get<PublicMember[]>(GLOBAL.api("members"));
  }

  getMemberProfile(id: number): Observable<MemberProfile> {
    return this.http.get<MemberProfile>(GLOBAL.api(`members/${id}`));
  }

  listAdminMembers(params?: {
    isActive?: number;
    memberTypeCode?: "researcher" | "phd_student" | "master_student" | "undergraduate_student" | "collaborator";
  }): Observable<AdminMemberListItem[]> {
    return this.http.get<AdminMemberListItem[]>(GLOBAL.admin("members"), {
      params: params as Record<string, string | number>,
    });
  }

  getMemberFull(id: number): Observable<MemberFull> {
    return this.http.get<MemberFull>(GLOBAL.admin(`members/${id}`));
  }

  createMember(body: MemberCreateBody): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(GLOBAL.admin("members"), body);
  }

  updateMember(id: number, body: MemberUpdateBody): Observable<{ status: number }> {
    return this.http.patch<{ status: number }>(GLOBAL.admin(`members/${id}`), body);
  }

  updateMemberTranslation(id: number, locale: string, bio: string): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`members/${id}/translations/${locale}`), { bio });
  }

  getMemberTranslation(id: number, locale: string): Observable<{ bio: string }> {
    return this.http.get<{ bio: string }>(GLOBAL.admin(`members/${id}/translations/${locale}`));
  }

  deleteMember(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`members/${id}`));
  }

  uploadAsset(id: number, file: File): Observable<{ status: number }> {
    const formData = new FormData();
    formData.append("asset", file, file.name);
    return this.http.put<{ status: number }>(GLOBAL.admin(`assets/member/${id}/photo`), formData);
  }

  deleteAsset(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`assets/member/${id}/photo`));
  }

  searchAuthors(q: string): Observable<AuthorSearchResult[]> {
    return this.http.get<AuthorSearchResult[]>(GLOBAL.admin("members/authors/search"), { params: { q } });
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
}
