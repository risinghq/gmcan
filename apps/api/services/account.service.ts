import { roleByCode } from "../authz/permissions.js";
import type { Locale } from "../lib/public-locale.js";
import { capabilitiesForActor } from "../middleware/authz.js";
import { memberFullName, resolveMemberPhotoView } from "./member-photo.service.js";
import { getMemberFull } from "./member.service.js";

/** The fields sign-in and `GET /admin/account/me` expose for the signed-in member. */
export async function getAccountView(memberId: number, locale: Locale) {
  const member = await getMemberFull(memberId, locale);
  if (!member) return undefined;

  const role = roleByCode[member.roleCode];
  const capabilities = role
    ? capabilitiesForActor({ id: member.id, roleCode: member.roleCode, role, isActive: member.isActive })
    : [];
  const photo = await resolveMemberPhotoView({ memberId, fullName: memberFullName(member), locale });
  return { ...member, ...photo, capabilities };
}
