import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { AdminProjectListItem } from "../models/admin-list";
import type { Project, ProjectWithMembers } from "../models/project";
import { GLOBAL } from "./global";

export interface ProjectBody {
  code: string;
  fundedAmountMinor: number;
  statusCode?: "planned" | "active" | "completed" | "archived";
  startDate: string;
  endDate?: string;
  researchLineId: number;
  currencyCode: "pen" | "usd";
  fundingSourceCode: "vrip" | "none";
  translations: Record<string, { title: string; description: string }>;
}

@Injectable({ providedIn: "root" })
export class ProjectService {
  private http = inject(HttpClient);

  listProjects(): Observable<ProjectWithMembers[]> {
    return this.http.get<ProjectWithMembers[]>(GLOBAL.api("projects"));
  }

  listAdminProjects(): Observable<AdminProjectListItem[]> {
    return this.http.get<AdminProjectListItem[]>(GLOBAL.admin("projects"));
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(GLOBAL.admin(`projects/${id}`));
  }

  createProject(body: ProjectBody): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(GLOBAL.admin("projects"), body);
  }

  updateProject(id: number, body: ProjectBody): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`projects/${id}`), body);
  }

  deleteProject(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`projects/${id}`));
  }

  getProjectMembers(id: number): Observable<AdminProjectListItem["members"]> {
    return this.http.get<AdminProjectListItem["members"]>(GLOBAL.admin(`projects/${id}/members`));
  }

  addProjectMember(id: number, memberId: number): Observable<{ status: number }> {
    return this.http.post<{ status: number }>(GLOBAL.admin(`projects/${id}/members`), { memberId });
  }

  removeProjectMember(id: number, memberId: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`projects/${id}/members/${memberId}`));
  }
}
