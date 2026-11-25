import { inject } from "@angular/core";
import type { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { GroupService } from "@app/shared/services/group.service";
import { MethodsService } from "@app/shared/services/methods.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import type { AdminEquipment, AdminMethod, AdminResearchLine, AdminSoftware } from "@gmcan/contracts/admin";
import { type Observable, map, of } from "rxjs";

/** The add route has no `:id`; its form starts empty. */
function byId<T>(route: ActivatedRouteSnapshot, load: (id: number) => Observable<T>): Observable<T | null> {
  const id = route.paramMap.get("id");
  return id === null ? of(null) : load(Number(id));
}

/** The site has one research group; new content belongs to it. */
export const contentGroupIdResolver: ResolveFn<number> = () =>
  inject(GroupService)
    .listGroups()
    .pipe(
      map((groups) => {
        const group = groups[0];
        if (!group) throw new Error("No research group exists");
        return group.id;
      }),
    );

export const researchLineItemResolver: ResolveFn<AdminResearchLine | null> = (route) => {
  const service = inject(ResearchLinesService);
  return byId(route, (id) => service.get(id));
};

export const methodItemResolver: ResolveFn<AdminMethod | null> = (route) => {
  const service = inject(MethodsService);
  return byId(route, (id) => service.get(id));
};

export const softwareItemResolver: ResolveFn<AdminSoftware | null> = (route) => {
  const service = inject(GroupService);
  return byId(route, (id) => service.getSoftwareItem(id));
};

export const equipmentItemResolver: ResolveFn<AdminEquipment | null> = (route) => {
  const service = inject(GroupService);
  return byId(route, (id) => service.getEquipment(id));
};
