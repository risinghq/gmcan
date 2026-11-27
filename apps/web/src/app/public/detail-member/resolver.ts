import { inject } from "@angular/core";
import type { ResolveFn } from "@angular/router";
import { RouteDataError } from "@app/shared/errors/app-error";
import { MemberService } from "@app/shared/services/member.service";
import type { PublicMemberProfile } from "@gmcan/contracts/public";
import { firstValueFrom } from "rxjs";

export const detailMemberResolver: ResolveFn<PublicMemberProfile> = (route) => {
  const id = Number(route.params["id"]);

  if (!Number.isInteger(id) || id < 1) {
    throw new RouteDataError({ code: "not_found", message: `Member ${route.params["id"]} not found` });
  }

  return firstValueFrom(inject(MemberService).getMemberProfile(id));
};
