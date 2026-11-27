import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { AdminProject, ProjectWrite } from "@gmcan/contracts/admin";
import type { PublicProject } from "@gmcan/contracts/public";
import { Observable } from "rxjs";

import type { AdminProjectListItem } from "../models/admin-list";
import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class ProjectService {
  private http = inject(HttpClient);

  listProjects(): Observable<PublicProject[]> {
    return this.http.get<PublicProject[]>(GLOBAL.api("projects"));
  }

  listAdminProjects(): Observable<AdminProjectListItem[]> {
    return this.http.get<AdminProjectListItem[]>(GLOBAL.admin("projects"));
  }

  getAdminProject(id: number): Observable<AdminProject> {
    return this.http.get<AdminProject>(GLOBAL.admin(`projects/${id}`));
  }

  createProject(body: ProjectWrite): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(GLOBAL.admin("projects"), body);
  }

  updateProject(id: number, body: ProjectWrite): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`projects/${id}`), body);
  }

  deleteProject(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`projects/${id}`));
  }
}
