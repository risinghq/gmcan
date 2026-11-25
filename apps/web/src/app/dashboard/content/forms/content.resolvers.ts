import { inject } from "@angular/core";
import type { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { GroupService } from "@app/shared/services/group.service";
import { MethodsService } from "@app/shared/services/methods.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import type {
  AdminAbout,
  AdminEquipment,
  AdminGroup,
  AdminMethod,
  AdminResearchLine,
  AdminSoftware,
} from "@gmcan/contracts/admin";
import { type Observable, map, of, switchMap } from "rxjs";

/** Returns null on the add route, which has no `:id`. */
export function byId<T>(route: ActivatedRouteSnapshot, load: (id: number) => Observable<T>): Observable<T | null> {
  const id = route.paramMap.get("id");
  return id === null ? of(null) : load(Number(id));
}

function first<T>(rows: readonly T[], missing: string): T {
  const row = rows[0];
  if (row === undefined) throw new Error(missing);
  return row;
}

function onlyGroup(service: GroupService): Observable<AdminGroup> {
  return service.listGroups().pipe(map((groups) => first(groups, "No research group exists")));
}

export const contentGroupIdResolver: ResolveFn<number> = () =>
  onlyGroup(inject(GroupService)).pipe(map((group) => group.id));

export const adminGroupResolver: ResolveFn<AdminGroup> = () => onlyGroup(inject(GroupService));

export const adminAboutResolver: ResolveFn<AdminAbout> = () => {
  const service = inject(GroupService);
  return onlyGroup(service).pipe(
    switchMap((group) => service.listAdminAbout(group.id)),
    map((pages) => first(pages, "The research group has no about page")),
  );
};

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
