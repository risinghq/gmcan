import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { Project, ProjectWithMembers } from "../models/project";
import { GLOBAL } from "./global";

export interface ProjectBody {
  title: string;
  titleEN?: string;
  code: string;
  fundedAmount: string;
  description: string;
  descriptionEN?: string;
  status?: number;
  startDate: string;
  endDate?: string;
  researchLineId: number;
  currencyId: number;
  fundingSourceId: number;
}

@Injectable({ providedIn: "root" })
export class ProjectService {
  private http = inject(HttpClient);

  // Public
  listProjects(): Observable<ProjectWithMembers[]> {
    return this.http.get<ProjectWithMembers[]>(`${GLOBAL.url}api/projects`);
  }

  // Admin
  listAdminProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${GLOBAL.url}admin/projects`);
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${GLOBAL.url}admin/projects/${id}`);
  }

  createProject(body: ProjectBody): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${GLOBAL.url}admin/projects`, body);
  }

  updateProject(id: number, body: ProjectBody): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/projects/${id}`, body);
  }

  deleteProject(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/projects/${id}`);
  }

  getProjectMembers(id: number): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${GLOBAL.url}admin/projects/${id}/members`);
  }

  addProjectMember(id: number, memberId: number): Observable<{ status: number }> {
    return this.http.post<{ status: number }>(`${GLOBAL.url}admin/projects/${id}/members`, { memberId });
  }

  removeProjectMember(id: number, memberId: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/projects/${id}/members/${memberId}`);
  }
}
