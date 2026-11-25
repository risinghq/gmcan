import { db } from "../db/client.js";
import type { RoleCode } from "../db/schema.js";
import type { Locale } from "../lib/public-locale.js";

export interface MemberPublishability {
  publishable: boolean;
  missing: string[];
}

interface PublishFields {
  dni: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: number;
  roleCode: RoleCode;
}

/** The public site lists active members with a name; the administrator account is never one of them. */
export function memberPublishability(member: PublishFields): MemberPublishability {
  const missing: string[] = [];
  if (!member.dni) missing.push("dni");
  if (!member.email) missing.push("email");
  if (!member.firstName) missing.push("firstName");
  if (!member.lastName) missing.push("lastName");
  if (member.isActive !== 1) missing.push("isActive");
  if (member.roleCode === "administrator") missing.push("roleCode");
  return { publishable: missing.length === 0, missing };
}

export function publicLocalizedMemberSelectQuery(locale: Locale) {
  return db
    .selectFrom("member")
    .leftJoin("member_translation", (join) =>
      join.onRef("member_translation.memberId", "=", "member.id").on("member_translation.locale", "=", locale),
    )
    .select([
      "member.id as id",
      "member.firstName as firstName",
      "member.lastName as lastName",
      "member.maternalName as maternalName",
      "member_translation.bio as bio",
      "member.roleCode as roleCode",
      "member.memberTypeCode as memberTypeCode",
      "member.prefixCode as prefixCode",
    ])
    .where("member.isActive", "=", 1)
    .where("member.roleCode", "!=", "administrator")
    .where("member.dni", "!=", "")
    .where("member.email", "!=", "")
    .where("member.firstName", "!=", "")
    .where("member.lastName", "!=", "");
}
