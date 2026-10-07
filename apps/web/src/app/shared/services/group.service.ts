import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, MonoTypeOperatorFunction, shareReplay, tap } from "rxjs";

import type { About, LocalizedAboutSectionContent, LocalizedHomeServicesTeaserContent } from "../models/about";
import type { Equipment } from "../models/equipment";
import type { Group } from "../models/group";
import type { Software } from "../models/software";
import { GLOBAL } from "./global";
import { SessionService } from "./session.service";

@Injectable({ providedIn: "root" })
export class GroupService {
  private http = inject(HttpClient);
  private session = inject(SessionService);
  private groupByLanguage = new Map<string, Observable<Group>>();

  // Public
  /** Every component asks for the group, so one request per language serves them all until an admin edit. */
  getGroup(): Observable<Group> {
    const language = this.session.language().locale === "en" ? "en" : "es";
    let group = this.groupByLanguage.get(language);
    if (!group) {
      group = this.http.get<Group>(GLOBAL.api("group")).pipe(shareReplay({ bufferSize: 1, refCount: false }));
      this.groupByLanguage.set(language, group);
    }
    return group;
  }

  private dropsGroup<T>(): MonoTypeOperatorFunction<T> {
    return tap(() => this.groupByLanguage.clear());
  }

  listPublicAbout(groupId: number): Observable<About[]> {
    return this.http.get<About[]>(GLOBAL.api(`group/${groupId}/about`));
  }

  listPublicSoftware(groupId: number): Observable<Software[]> {
    return this.http.get<Software[]>(GLOBAL.api(`group/${groupId}/software`));
  }

  listPublicEquipment(groupId: number): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(GLOBAL.api(`group/${groupId}/equipment`));
  }

  // Admin
  listGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(GLOBAL.admin("group"));
  }

  updateInfo(id: number, data: { email?: string; phone?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`group/${id}/info`), data).pipe(this.dropsGroup());
  }

  updateSummary(id: number, data: { summary: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`group/${id}/summary`), data).pipe(this.dropsGroup());
  }

  updateFacilities(id: number, data: { facilities?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`group/${id}/facilities`), data).pipe(this.dropsGroup());
  }

  updateFutureWork(id: number, data: { futureWork?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`group/${id}/future-work`), data).pipe(this.dropsGroup());
  }

  updatePublicationsSection(id: number, data: { publicationsSection?: string }): Observable<{ status: number }> {
    return this.http
      .put<{ status: number }>(GLOBAL.admin(`group/${id}/publications-section`), data)
      .pipe(this.dropsGroup());
  }

  updateProjectsSection(id: number, data: { projectsSection?: string }): Observable<{ status: number }> {
    return this.http
      .put<{ status: number }>(GLOBAL.admin(`group/${id}/projects-section`), data)
      .pipe(this.dropsGroup());
  }

  uploadAsset(id: number, slot: "facilities" | "header" | "footer", file: File): Observable<{ status: number }> {
    const formData = new FormData();
    formData.append("asset", file, file.name);
    return this.http
      .put<{ status: number }>(GLOBAL.admin(`assets/research_group/${id}/${slot}`), formData)
      .pipe(this.dropsGroup());
  }

  // About (admin)
  listAdminAbout(groupId: number): Observable<About[]> {
    return this.http.get<About[]>(GLOBAL.admin(`group/${groupId}/about`));
  }

  updateAboutDescription(id: number, data: { description: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`group/about/${id}/description`), data);
  }

  updateAboutObjectives(
    id: number,
    data: { objectivesContent: LocalizedAboutSectionContent },
  ): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`group/about/${id}/objectives`), data);
  }

  updateAboutServices(
    id: number,
    data: { servicesContent: LocalizedAboutSectionContent },
  ): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`group/about/${id}/services`), data);
  }

  updateAboutHomeServicesTeaser(
    id: number,
    data: { homeServicesTeaserContent: LocalizedHomeServicesTeaserContent },
  ): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`group/about/${id}/home-services-teaser`), data);
  }

  uploadAboutAsset(id: number, file: File): Observable<{ status: number }> {
    const formData = new FormData();
    formData.append("asset", file, file.name);
    return this.http.put<{ status: number }>(GLOBAL.admin(`assets/about/${id}/photo`), formData);
  }

  // Software (under group routes)
  listSoftware(groupId: number): Observable<Software[]> {
    return this.http.get<Software[]>(GLOBAL.admin(`group/${groupId}/software`));
  }

  getSoftwareItem(id: number): Observable<Software> {
    return this.http.get<Software>(GLOBAL.admin(`group/software/${id}`));
  }

  createSoftware(data: {
    name?: string;
    description?: string;
    moreInfo?: string;
    groupId: number;
  }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(GLOBAL.admin("group/software"), data);
  }

  updateSoftware(
    id: number,
    data: { name?: string; description?: string; moreInfo?: string },
  ): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`group/software/${id}`), data);
  }

  deleteSoftware(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`group/software/${id}`));
  }

  // Equipment (under group routes)
  listEquipment(groupId: number): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(GLOBAL.admin(`group/${groupId}/equipment`));
  }

  getEquipment(id: number): Observable<Equipment> {
    return this.http.get<Equipment>(GLOBAL.admin(`group/equipment/${id}`));
  }

  createEquipment(data: {
    name: string;
    cpu?: string;
    gpu?: string;
    ram?: string;
    storage?: string;
    groupId: number;
  }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(GLOBAL.admin("group/equipment"), data);
  }

  updateEquipment(
    id: number,
    data: { name?: string; cpu?: string; gpu?: string; ram?: string; storage?: string },
  ): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`group/equipment/${id}`), data);
  }

  deleteEquipment(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`group/equipment/${id}`));
  }
}
