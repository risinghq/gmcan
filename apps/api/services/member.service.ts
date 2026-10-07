import { db } from "../db/client.js";
import { MEMBER_ACTIVE, MEMBER_NAME } from "../db/projections.js";
import type { GenderCode, MemberTypeCode, PrefixCode, RoleCode } from "../db/schema.js";
import { memberProjects, memberPublications } from "../db/views.js";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../lib/locales.js";
import { hashPassword } from "../lib/password.js";
import { type Locale } from "../lib/public-locale.js";
import type { AdminMemberListItem } from "./admin-list.types.js";
import { memberFullName, resolveMemberPhotoView } from "./member-photo.service.js";
import { publicLocalizedMemberSelectQuery } from "./member-read-model.js";

const REQUIRED_MEMBER_BASE_FIELDS = ["dni", "email", "firstName", "lastName", "isActive"] as const;
const REQUIRED_MEMBER_TRANSLATED_FIELDS = ["bio"] as const;

export interface MemberPublishability {
  publishable: boolean;
  missing: {
    base: string[];
    translations: Record<string, string[]>;
  };
}

export async function listMembersLocalized(locale: Locale) {
  return publicLocalizedMemberSelectQuery(locale).execute();
}

export async function listAdminMembers(
  locale: Locale,
  filter?: {
    isActive?: number;
    memberTypeCode?: MemberTypeCode;
    q?: string;
  },
): Promise<AdminMemberListItem[]> {
  let query = db
    .selectFrom("member")
    .leftJoin("member_type", "member_type.code", "member.memberTypeCode")
    .leftJoin("member_type_translation", (join) =>
      join
        .onRef("member_type_translation.memberTypeCode", "=", "member_type.code")
        .on("member_type_translation.locale", "=", locale),
    )
    .leftJoin("member_translation", (join) =>
      join.onRef("member_translation.memberId", "=", "member.id").on("member_translation.locale", "=", locale),
    )
    .leftJoin("prefix", "prefix.code", "member.prefixCode")
    .select([
      "member.id",
      "member.dni",
      "member.email",
      "member.firstName",
      "member.lastName",
      "member.maternalName",
      "member.birthDate",
      "member_translation.bio as bio",
      "member.isActive",
      "member.roleCode",
      "member.memberTypeCode",
      "member.prefixCode",
      "member_type_translation.nameSingular as memberTypeName",
      "prefix.label as prefixName",
    ]);

  if (filter?.isActive !== undefined) query = query.where("member.isActive", "=", filter.isActive);
  if (filter?.memberTypeCode !== undefined) query = query.where("member.memberTypeCode", "=", filter.memberTypeCode);
  if (filter?.q) {
    const like = `%${filter.q}%`;
    query = query.where((eb) =>
      eb.or([
        eb("member.firstName", "like", like),
        eb("member.lastName", "like", like),
        eb("member.maternalName", "like", like),
        eb("member.email", "like", like),
      ]),
    );
  }

  const rows = await query.orderBy("member.lastName", "asc").execute();
  const memberIds = rows.map((row) => row.id);
  const translationRows =
    memberIds.length === 0
      ? []
      : await db
          .selectFrom("member_translation")
          .select(["memberId", "locale", "bio"])
          .where("memberId", "in", memberIds)
          .where("locale", "in", SUPPORTED_LOCALES)
          .execute();

  const translationsByMember = new Map<number, Map<string, string | null>>();
  for (const tr of translationRows) {
    if (!translationsByMember.has(tr.memberId)) translationsByMember.set(tr.memberId, new Map());
    translationsByMember.get(tr.memberId)!.set(tr.locale, tr.bio);
  }

  return Promise.all(
    rows.map(async (row) => {
      const missingBase: string[] = [];
      if (!row.dni) missingBase.push("dni");
      if (!row.email) missingBase.push("email");
      if (!row.firstName) missingBase.push("firstName");
      if (!row.lastName) missingBase.push("lastName");
      if (row.isActive !== 1) missingBase.push("isActive");

      const memberTranslations = translationsByMember.get(row.id) ?? new Map<string, string | null>();
      const missingTranslations: Record<string, string[]> = {};
      for (const supportedLocale of SUPPORTED_LOCALES) {
        const missing: string[] = [];
        const bio = memberTranslations.get(supportedLocale);
        if (!bio || bio.trim().length === 0) missing.push("bio");
        if (missing.length > 0) missingTranslations[supportedLocale] = missing;
      }

      return {
        id: row.id,
        dni: row.dni,
        email: row.email,
        firstName: row.firstName,
        lastName: row.lastName,
        maternalName: row.maternalName,
        birthDate: row.birthDate,
        bio: row.bio,
        isActive: row.isActive,
        roleCode: row.roleCode,
        memberTypeCode: row.memberTypeCode,
        memberTypeName: row.memberTypeName ?? "",
        prefixCode: row.prefixCode,
        prefixName: row.prefixName,
        ...(await resolveMemberPhotoView({
          memberId: row.id,
          fullName: memberFullName(row),
          locale,
        })),
        publishability: {
          publishable: missingBase.length === 0 && Object.keys(missingTranslations).length === 0,
          missing: { base: missingBase, translations: missingTranslations },
        },
      };
    }),
  );
}

export async function listMemberNames() {
  return db.selectFrom("member").select(MEMBER_NAME).execute();
}

export async function listActiveMembers(isActive: number) {
  return db.selectFrom("member").select(MEMBER_ACTIVE).where("isActive", "=", isActive).execute();
}

export async function listMembersByType(memberTypeCode: MemberTypeCode) {
  return db.selectFrom("member").select(MEMBER_ACTIVE).where("memberTypeCode", "=", memberTypeCode).execute();
}

export async function getMemberFull(id: number, locale: Locale = DEFAULT_LOCALE) {
  return db
    .selectFrom("member")
    .leftJoin("member_translation", (join) =>
      join.onRef("member_translation.memberId", "=", "member.id").on("member_translation.locale", "=", locale),
    )
    .select([
      "member.id as id",
      "member.dni as dni",
      "member.email as email",
      "member.firstName as firstName",
      "member.lastName as lastName",
      "member.maternalName as maternalName",
      "member.birthDate as birthDate",
      "member_translation.bio as bio",
      "member.isActive as isActive",
      "member.roleCode as roleCode",
      "member.memberTypeCode as memberTypeCode",
      "member.prefixCode as prefixCode",
      "member.genderCode as genderCode",
      "member.passwordResetRequired as passwordResetRequired",
      "member.resetToken as resetToken",
      "member.resetExpiresAt as resetExpiresAt",
    ])
    .where("member.id", "=", id)
    .executeTakeFirst();
}

export async function getMemberByEmail(email: string) {
  return db
    .selectFrom("member")
    .select([
      "id",
      "dni",
      "email",
      "firstName",
      "lastName",
      "maternalName",
      "birthDate",
      "isActive",
      "roleCode",
      "memberTypeCode",
      "prefixCode",
      "genderCode",
      "passwordHash",
      "passwordResetRequired",
      "resetToken",
      "resetExpiresAt",
    ])
    .where("email", "=", email)
    .executeTakeFirst();
}

export async function getMemberProfileLocalized(id: number, locale: Locale) {
  const [member, projects, publications] = await Promise.all([
    publicLocalizedMemberSelectQuery(locale).where("member.id", "=", id).executeTakeFirst(),
    memberProjects(id),
    memberPublications(id),
  ]);
  return { member, projects, publications };
}

export async function searchAuthorPool(q: string, locale: Locale = DEFAULT_LOCALE) {
  const like = `%${q}%`;
  const [members, externals] = await Promise.all([
    db
      .selectFrom("member")
      .select(["id", "firstName", "lastName", "maternalName"])
      .where((eb) =>
        eb.or([eb("firstName", "like", like), eb("lastName", "like", like), eb("maternalName", "like", like)]),
      )
      .orderBy("firstName", "asc")
      .execute(),
    db
      .selectFrom("publication_author")
      .select("externalName")
      .where("memberId", "is", null)
      .where("externalName", "like", like)
      .distinct()
      .orderBy("externalName", "asc")
      .execute(),
  ]);

  const resolvedMembers = await Promise.all(
    members.map(async (m) => ({
      kind: "registered" as const,
      memberId: m.id,
      name: `${m.firstName} ${m.lastName}${m.maternalName ? " " + m.maternalName : ""}`.trim(),
      photo: null,
      ...(await resolveMemberPhotoView({
        memberId: m.id,
        fullName: memberFullName(m),
        locale,
      })),
    })),
  );

  return [
    ...resolvedMembers,
    ...externals
      .filter((e) => e.externalName != null)
      .map((e) => ({ kind: "external" as const, name: e.externalName! })),
  ];
}

export async function verifyEmailExists(email: string) {
  return db.selectFrom("member").select("id").where("email", "=", email).executeTakeFirst();
}

export async function verifyDniExists(dni: string) {
  return db.selectFrom("member").select("id").where("dni", "=", dni).executeTakeFirst();
}

export async function createMember(data: {
  dni: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  maternalName?: string;
  birthDate?: string;
  isActive: number;
  roleCode: RoleCode;
  memberTypeCode: MemberTypeCode;
  prefixCode?: PrefixCode | null;
  genderCode?: GenderCode | null;
  translation?: { locale: string; bio: string };
}) {
  const { password, translation, ...rest } = data;
  const now = new Date().toISOString();
  return db.transaction().execute(async (trx) => {
    const result = await trx
      .insertInto("member")
      .values({
        ...rest,
        passwordHash: hashPassword(password),
        passwordResetRequired: 0,
        resetToken: null,
        resetExpiresAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .executeTakeFirstOrThrow();

    const memberId = Number(result.insertId);
    await trx
      .insertInto("member_translation")
      .values(SUPPORTED_LOCALES.map((locale) => ({ memberId, locale, bio: null })))
      .onConflict((oc) => oc.columns(["memberId", "locale"]).doNothing())
      .execute();

    if (translation) {
      await trx
        .insertInto("member_translation")
        .values({ memberId, locale: translation.locale, bio: translation.bio })
        .onConflict((oc) => oc.columns(["memberId", "locale"]).doUpdateSet((eb) => ({ bio: eb.ref("excluded.bio") })))
        .execute();
    }

    return memberId;
  });
}

export async function updateMember(
  id: number,
  data: {
    email: string;
    firstName: string;
    lastName: string;
    maternalName?: string;
    birthDate?: string;
    isActive: number;
    roleCode: RoleCode;
    memberTypeCode: MemberTypeCode;
    prefixCode?: PrefixCode | null;
    genderCode?: GenderCode | null;
    translation?: { locale: string; bio: string };
  },
) {
  const now = new Date().toISOString();
  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable("member")
      .set({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        maternalName: data.maternalName,
        birthDate: data.birthDate,
        isActive: data.isActive,
        roleCode: data.roleCode,
        memberTypeCode: data.memberTypeCode,
        prefixCode: data.prefixCode,
        genderCode: data.genderCode,
        updatedAt: now,
      })
      .where("id", "=", id)
      .execute();

    if (data.translation) {
      await trx
        .insertInto("member_translation")
        .values({ memberId: id, locale: data.translation.locale, bio: data.translation.bio })
        .onConflict((oc) => oc.columns(["memberId", "locale"]).doUpdateSet((eb) => ({ bio: eb.ref("excluded.bio") })))
        .execute();
    }
  });
}

export async function updateMemberTranslation(id: number, locale: string, bio: string) {
  await db
    .insertInto("member_translation")
    .values({ memberId: id, locale, bio })
    .onConflict((oc) => oc.columns(["memberId", "locale"]).doUpdateSet((eb) => ({ bio: eb.ref("excluded.bio") })))
    .execute();
}

export async function getMemberTranslation(id: number, locale: string) {
  return db
    .selectFrom("member_translation")
    .select(["memberId", "locale", "bio"])
    .where("memberId", "=", id)
    .where("locale", "=", locale)
    .executeTakeFirst();
}

export async function evaluateMemberPublishability(id: number): Promise<MemberPublishability> {
  const member = await db
    .selectFrom("member")
    .select(["id", "dni", "email", "firstName", "lastName", "isActive"])
    .where("id", "=", id)
    .executeTakeFirst();

  if (!member) {
    return { publishable: false, missing: { base: ["member"], translations: {} as Record<string, string[]> } };
  }

  const missingBase: string[] = [];
  if (!member.dni) missingBase.push("dni");
  if (!member.email) missingBase.push("email");
  if (!member.firstName) missingBase.push("firstName");
  if (!member.lastName) missingBase.push("lastName");
  if (member.isActive !== 1) missingBase.push("isActive");

  const rows = await db
    .selectFrom("member_translation")
    .select(["locale", "bio"])
    .where("memberId", "=", id)
    .where("locale", "in", SUPPORTED_LOCALES)
    .execute();
  const map = new Map(rows.map((r) => [r.locale, r.bio]));
  const missingTranslations: Record<string, string[]> = {};
  for (const locale of SUPPORTED_LOCALES) {
    const bio = map.get(locale);
    const missing: string[] = [];
    if (!bio || bio.trim().length === 0) missing.push("bio");
    if (missing.length > 0) missingTranslations[locale] = missing;
  }

  const publishable = missingBase.length === 0 && Object.keys(missingTranslations).length === 0;
  return { publishable, missing: { base: missingBase, translations: missingTranslations } };
}

export async function getMemberPublishability(id: number): Promise<MemberPublishability> {
  return evaluateMemberPublishability(id);
}

export const MEMBER_PUBLISHABILITY_REQUIREMENTS = {
  base: REQUIRED_MEMBER_BASE_FIELDS,
  translated: REQUIRED_MEMBER_TRANSLATED_FIELDS,
} as const;

export async function deleteMember(id: number) {
  await db.deleteFrom("member").where("id", "=", id).execute();
}

export async function updatePassword(email: string, newPassword: string) {
  await db
    .updateTable("member")
    .set({ passwordHash: hashPassword(newPassword), passwordResetRequired: 0, resetToken: null, resetExpiresAt: null })
    .where("email", "=", email)
    .execute();
}

export async function getResetPasswordStatus(email: string) {
  return db.selectFrom("member").select("passwordResetRequired").where("email", "=", email).executeTakeFirst();
}

export async function setResetToken(memberId: number, token: string, expiresAt: string) {
  await db
    .updateTable("member")
    .set({ resetToken: token, resetExpiresAt: expiresAt, passwordResetRequired: 1 })
    .where("id", "=", memberId)
    .execute();
}

export async function getMemberByResetToken(token: string) {
  const now = new Date().toISOString();
  return db
    .selectFrom("member")
    .select(["id", "firstName", "email"])
    .where("resetToken", "=", token)
    .where("resetExpiresAt", ">", now)
    .where("passwordResetRequired", "=", 1)
    .executeTakeFirst();
}

export async function consumeResetToken(memberId: number, newPassword: string) {
  await db
    .updateTable("member")
    .set({ passwordHash: hashPassword(newPassword), resetToken: null, resetExpiresAt: null, passwordResetRequired: 0 })
    .where("id", "=", memberId)
    .execute();
}

export async function listMemberGroups(memberId: number) {
  return db.selectFrom("member_group").selectAll().where("memberId", "=", memberId).execute();
}

export async function listGroupMembers(groupId: number) {
  return db.selectFrom("member_group").selectAll().where("groupId", "=", groupId).execute();
}

export async function addMemberToGroup(memberId: number, groupId: number) {
  const now = new Date().toISOString();
  await db.insertInto("member_group").values({ memberId, groupId, createdAt: now, updatedAt: now }).execute();
}

export async function removeMemberFromGroup(memberId: number, groupId: number) {
  await db.deleteFrom("member_group").where("memberId", "=", memberId).where("groupId", "=", groupId).execute();
}
