import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type {
  AboutWrite,
  AdminAbout,
  AdminEquipment,
  AdminGroup,
  AdminSoftware,
  AssetSlot,
  EquipmentFields,
  GroupWrite,
  SoftwareTranslation,
  Translations,
} from "@gmcan/contracts/admin";
import { Observable, MonoTypeOperatorFunction, shareReplay, tap } from "rxjs";

import type { About } from "../models/about";
import type { Equipment } from "../models/equipment";
import type { Group } from "../models/group";
import type { Software } from "../models/software";
import { AssetService } from "./asset.service";
import { GLOBAL } from "./global";
import { SessionService } from "./session.service";

export interface SoftwareWrite {
  translations: Translations<SoftwareTranslation>;
  moreInfo?: string;
}

@Injectable({ providedIn: "root" })
export class GroupService {
  private http = inject(HttpClient);
  private session = inject(SessionService);
  private assets = inject(AssetService);
  private groupByLanguage = new Map<string, Observable<Group>>();

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

  listGroups(): Observable<AdminGroup[]> {
    return this.http.get<AdminGroup[]>(GLOBAL.admin("group"));
  }

  updateGroup(id: number, data: GroupWrite): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`group/${id}`), data).pipe(this.dropsGroup());
  }

  uploadAsset(id: number, slot: AssetSlot<"research_group">, file: File): Observable<{ status: number }> {
    return this.assets.put({ ownerType: "research_group", ownerId: id, slot }, file).pipe(this.dropsGroup());
  }

  listAdminAbout(groupId: number): Observable<AdminAbout[]> {
    return this.http.get<AdminAbout[]>(GLOBAL.admin(`group/${groupId}/about`));
  }

  updateAbout(id: number, data: AboutWrite): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`group/about/${id}`), data);
  }

  listSoftware(groupId: number): Observable<AdminSoftware[]> {
    return this.http.get<AdminSoftware[]>(GLOBAL.admin(`group/${groupId}/software`));
  }

  getSoftwareItem(id: number): Observable<AdminSoftware> {
    return this.http.get<AdminSoftware>(GLOBAL.admin(`group/software/${id}`));
  }

  createSoftware(data: SoftwareWrite & { groupId: number }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(GLOBAL.admin("group/software"), data);
  }

  updateSoftware(id: number, data: SoftwareWrite): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`group/software/${id}`), data);
  }

  deleteSoftware(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`group/software/${id}`));
  }

  listEquipment(groupId: number): Observable<AdminEquipment[]> {
    return this.http.get<AdminEquipment[]>(GLOBAL.admin(`group/${groupId}/equipment`));
  }

  getEquipment(id: number): Observable<AdminEquipment> {
    return this.http.get<AdminEquipment>(GLOBAL.admin(`group/equipment/${id}`));
  }

  createEquipment(data: EquipmentFields & { groupId: number }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(GLOBAL.admin("group/equipment"), data);
  }

  updateEquipment(id: number, data: EquipmentFields): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`group/equipment/${id}`), data);
  }

  deleteEquipment(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`group/equipment/${id}`));
  }
}
