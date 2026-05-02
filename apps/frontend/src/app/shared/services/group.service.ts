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

  // Admin
  listGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${GLOBAL.url}admin/group`);
  }

  updateInfo(id: number, data: { email?: string; phone?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/${id}/info`, data);
  }

  updateSummary(id: number, data: { summaryES: string; summaryEN: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/${id}/summary`, data);
  }

  updateFacilities(id: number, data: { facilitiesES?: string; facilitiesEN?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/${id}/facilities`, data);
  }

  updateFutureWork(id: number, data: { futureWorkES?: string; futureWorkEN?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/${id}/future-work`, data);
  }

  updatePublicationsSection(
    id: number,
    data: { publicationsSectionES?: string; publicationsSectionEN?: string },
  ): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/${id}/publications-section`, data);
  }

  updateProjectsSection(
    id: number,
    data: { projectsSectionES?: string; projectsSectionEN?: string },
  ): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/${id}/projects-section`, data);
  }

  uploadFile(id: number, slot: "facilities" | "header" | "footer", file: File): Observable<{ status: number }> {
    const formData = new FormData();
    formData.append("file", file, file.name);
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/${id}/files/${slot}`, formData);
  }

  // About
  listAbout(groupId: number): Observable<About[]> {
    return this.http.get<About[]>(`${GLOBAL.url}admin/group/${groupId}/about`);
  }

  updateAboutDescription(
    id: number,
    data: { descriptionES: string; descriptionEN: string },
  ): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/about/${id}/description`, data);
  }

  updateAboutObjectives(
    id: number,
    data: { objectivesES?: string; objectivesEN?: string },
  ): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/about/${id}/objectives`, data);
  }

  updateAboutServices(id: number, data: { servicesES?: string; servicesEN?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/about/${id}/services`, data);
  }

  uploadAboutPhoto(id: number, file: File): Observable<{ status: number }> {
    const formData = new FormData();
    formData.append("file", file, file.name);
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/group/about/${id}/photo`, formData);
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
    descriptionEN?: string;
    moreInfo?: string;
    groupId: number;
  }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${GLOBAL.url}admin/group/software`, data);
  }

  updateSoftware(
    id: number,
    data: { name?: string; description?: string; descriptionEN?: string; moreInfo?: string },
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
