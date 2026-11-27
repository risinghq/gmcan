import { TestBed } from "@angular/core/testing";
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { toNavigationAppError } from "@app/shared/errors/app-error";
import { MemberService } from "@app/shared/services/member.service";
import { of } from "rxjs";
import { describe, expect, it, vi } from "vitest";

import { detailMemberResolver } from "./resolver";

function resolve(
  id: string,
  getMemberProfile = vi.fn(() => of({ member: { id: 3 }, projects: [], publications: [] })),
) {
  TestBed.configureTestingModule({ providers: [{ provide: MemberService, useValue: { getMemberProfile } }] });
  const route = { params: { id } } as unknown as ActivatedRouteSnapshot;
  const result = TestBed.runInInjectionContext(async () => detailMemberResolver(route, {} as RouterStateSnapshot));
  return { result, getMemberProfile };
}

describe("detailMemberResolver", () => {
  it.each(["abc", "0", "-1", "2.5"])("treats id %s as not found without calling the API", async (id) => {
    const { result, getMemberProfile } = resolve(id);

    await expect(result).rejects.toSatisfy((error) => toNavigationAppError(error).code === "not_found");
    expect(getMemberProfile).not.toHaveBeenCalled();
  });

  it("loads the profile for a numeric id", async () => {
    const { result, getMemberProfile } = resolve("3");

    await expect(result).resolves.toMatchObject({ member: { id: 3 } });
    expect(getMemberProfile).toHaveBeenCalledWith(3);
  });
});
