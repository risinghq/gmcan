import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { About } from "../models/about";
import type { Equipment } from "../models/equipment";
import type { Group } from "../models/group";
import type { Software } from "../models/software";
import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class GroupService {
  private http = inject(HttpClient);

  // Public
  getGroup(): Observable<Group> {
    return this.http.get<Group>(`${GLOBAL.url}api/group`);
  }

  listPublicAbout(groupId: number): Observable<About[]> {
    return this.http.get<About[]>(`${GLOBAL.url}api/group/${groupId}/about`);
  }

  // Admin
  listGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${GLOBAL.url}admin/group`);
  }

  updateInfo(id: number, data: { email?: string; phone?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/${id}/info`, data);
  }

  updateSummary(id: number, data: { summary: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/${id}/summary`, data);
  }

  updateFacilities(id: number, data: { facilities?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/${id}/facilities`, data);
  }

  updateFutureWork(id: number, data: { futureWork?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/${id}/future-work`, data);
  }

  updatePublicationsSection(id: number, data: { publicationsSection?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/${id}/publications-section`, data);
  }

  updateProjectsSection(id: number, data: { projectsSection?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/${id}/projects-section`, data);
  }

  uploadAsset(id: number, slot: "facilities" | "header" | "footer", file: File): Observable<{ status: number }> {
    const formData = new FormData();
    formData.append("asset", file, file.name);
    const mappedSlot =
      slot === "facilities" ? "facilitiesPhoto" : slot === "header" ? "logoHeader" : "logoFooter";
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/assets/research_group/${id}/${mappedSlot}`, formData);
  }

  // About (admin)
  listAdminAbout(groupId: number): Observable<About[]> {
    return this.http.get<About[]>(`${GLOBAL.url}admin/group/${groupId}/about`);
  }

  updateAboutDescription(id: number, data: { description: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/about/${id}/description`, data);
  }

  updateAboutObjectives(id: number, data: { objectives?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/about/${id}/objectives`, data);
  }

  updateAboutServices(id: number, data: { services?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/about/${id}/services`, data);
  }

  uploadAboutAsset(id: number, file: File): Observable<{ status: number }> {
    const formData = new FormData();
    formData.append("asset", file, file.name);
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/assets/about/${id}/photo`, formData);
  }

  // Software (under group routes)
  listSoftware(groupId: number): Observable<Software[]> {
    return this.http.get<Software[]>(`${GLOBAL.url}admin/group/${groupId}/software`);
  }

  getSoftwareItem(id: number): Observable<Software> {
    return this.http.get<Software>(`${GLOBAL.url}admin/group/software/${id}`);
  }

  createSoftware(data: {
    name?: string;
    description?: string;
    moreInfo?: string;
    groupId: number;
  }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${GLOBAL.url}admin/group/software`, data);
  }

  updateSoftware(
    id: number,
    data: { name?: string; description?: string; moreInfo?: string },
  ): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/software/${id}`, data);
  }

  deleteSoftware(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/group/software/${id}`);
  }

  // Equipment (under group routes)
  listEquipment(groupId: number): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${GLOBAL.url}admin/group/${groupId}/equipment`);
  }

  getEquipment(id: number): Observable<Equipment> {
    return this.http.get<Equipment>(`${GLOBAL.url}admin/group/equipment/${id}`);
  }

  createEquipment(data: {
    name: string;
    cpu?: string;
    gpu?: string;
    ram?: string;
    storage?: string;
    groupId: number;
  }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${GLOBAL.url}admin/group/equipment`, data);
  }

  updateEquipment(
    id: number,
    data: { name?: string; cpu?: string; gpu?: string; ram?: string; storage?: string },
  ): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/equipment/${id}`, data);
  }

  deleteEquipment(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/group/equipment/${id}`);
  }
}
