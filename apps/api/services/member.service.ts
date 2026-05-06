import { db } from "../db/client.js";
import { MEMBER_ACTIVE, MEMBER_NAME, MEMBER_PUBLIC } from "../db/projections.js";
import { memberProjects, memberPublications, publicProfile } from "../db/views.js";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../lib/locales.js";
import { hashPassword } from "../lib/password.js";
import { type Locale } from "../lib/public-locale.js";
import type { AdminMemberListItem } from "./admin-list.types.js";
import { resolveAssetAccessUrl } from "./asset.service.js";
import { publicLocalizedMemberSelectQuery } from "./member-read-model.js";

export async function listMembers() {
  return db.selectFrom("member").select(MEMBER_PUBLIC).execute();
}

export async function listMembersLocalized(locale: Locale) {
  return publicLocalizedMemberSelectQuery(locale).execute();
}

export async function listAdminMembers(filter?: {
  status?: number;
  memberTypeId?: number;
  q?: string;
}): Promise<AdminMemberListItem[]> {
  let query = db
    .selectFrom("member")
    .leftJoin("member_type", "member_type.id", "member.memberTypeId")
    .leftJoin("member_type_translation", (join) =>
      join
        .onRef("member_type_translation.memberTypeId", "=", "member_type.id")
        .on("member_type_translation.locale", "=", DEFAULT_LOCALE),
    )
    .leftJoin("member_translation", (join) =>
      join.onRef("member_translation.memberId", "=", "member.id").on("member_translation.locale", "=", DEFAULT_LOCALE),
    )
    .leftJoin("prefix", "prefix.id", "member.prefixId")
    .select([
      "member.id",
      "member.dni",
      "member.email",
      "member.firstName",
      "member.lastName",
      "member.maternalName",
      "member.birthDate",
      "member_translation.bio as bio",
      "member.status",
      "member.roleId",
      "member.memberTypeId",
      "member.prefixId",
      "member_type_translation.nameSingular as memberTypeName",
      "prefix.name as prefixName",
    ]);

  if (filter?.status !== undefined) query = query.where("member.status", "=", filter.status);
  if (filter?.memberTypeId !== undefined) query = query.where("member.memberTypeId", "=", filter.memberTypeId);
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
  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      dni: row.dni,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      maternalName: row.maternalName,
      birthDate: row.birthDate,
      bio: row.bio,
      status: row.status,
      roleId: row.roleId,
      memberTypeId: row.memberTypeId,
      memberTypeName: row.memberTypeName ?? "",
      prefixId: row.prefixId,
      prefixName: row.prefixName,
      asset: await resolveAssetAccessUrl({ resourceType: "member", resourceId: row.id, slot: "photo" }),
    })),
  );
}

export async function listMemberNames() {
  return db.selectFrom("member").select(MEMBER_NAME).execute();
}

export async function listActiveMembers(status: number) {
  return db.selectFrom("member").select(MEMBER_ACTIVE).where("status", "=", status).execute();
}

export async function listMembersByType(memberTypeId: number) {
  return db.selectFrom("member").select(MEMBER_ACTIVE).where("memberTypeId", "=", memberTypeId).execute();
}

export async function getMember(id: number) {
  return db.selectFrom("member").select(MEMBER_PUBLIC).where("id", "=", id).executeTakeFirst();
}

export async function getMemberFull(id: number) {
  return db
    .selectFrom("member")
    .leftJoin("member_translation", (join) =>
      join.onRef("member_translation.memberId", "=", "member.id").on("member_translation.locale", "=", DEFAULT_LOCALE),
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
      "member.status as status",
      "member.roleId as roleId",
      "member.memberTypeId as memberTypeId",
      "member.prefixId as prefixId",
      "member.genderId as genderId",
    ])
    .where("member.id", "=", id)
    .executeTakeFirst();
}

export async function getMemberByEmail(email: string) {
  return db
    .selectFrom("member")
    .select([...MEMBER_PUBLIC, "password"])
    .where("email", "=", email)
    .executeTakeFirst();
}

export async function getMemberByDni(dni: string) {
  return db.selectFrom("member").select(MEMBER_PUBLIC).where("dni", "=", dni).executeTakeFirst();
}

export async function getMemberProfile(id: number) {
  return publicProfile(id);
}

export async function getMemberProfileLocalized(id: number, locale: Locale) {
  const [member, projects, publications] = await Promise.all([
    publicLocalizedMemberSelectQuery(locale).where("member.id", "=", id).executeTakeFirst(),
    memberProjects(id),
    memberPublications(id),
  ]);
  return { member, projects, publications };
}

export async function searchMembers(q: string) {
  const term = `%${q}%`;
  return db
    .selectFrom("member")
    .select(MEMBER_PUBLIC)
    .where((eb) =>
      eb.or([
        eb("firstName", "like", term),
        eb("lastName", "like", term),
        eb("maternalName", "like", term),
        eb("email", "like", term),
      ]),
    )
    .execute();
}

export async function searchAuthorPool(q: string) {
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
      photoUrl: await resolveAssetAccessUrl({ resourceType: "member", resourceId: m.id, slot: "photo" }),
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
  status: number;
  roleId: number;
  memberTypeId: number;
  prefixId?: number;
  genderId?: number;
  translation?: { locale: string; bio: string };
}) {
  const { password, translation, ...rest } = data;
  const today = new Date().toISOString().split("T")[0];
  return db.transaction().execute(async (trx) => {
    const result = await trx
      .insertInto("member")
      .values({
        ...rest,
        password: hashPassword(password),
        resetPassword: 0,
        createdAt: today,
        updatedAt: today,
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
    status: number;
    roleId: number;
    memberTypeId: number;
    prefixId?: number;
    genderId?: number;
    translation?: { locale: string; bio: string };
  },
) {
  const today = new Date().toISOString().split("T")[0];
  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable("member")
      .set({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        maternalName: data.maternalName,
        birthDate: data.birthDate,
        status: data.status,
        roleId: data.roleId,
        memberTypeId: data.memberTypeId,
        prefixId: data.prefixId,
        genderId: data.genderId,
        updatedAt: today,
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

export async function getMemberPublishability(id: number) {
  const member = await db
    .selectFrom("member")
    .select(["id", "dni", "email", "firstName", "lastName", "status"])
    .where("id", "=", id)
    .executeTakeFirst();
  if (!member)
    return { publishable: false, missing: { base: ["member"], translations: {} as Record<string, string[]> } };

  const missingBase: string[] = [];
  if (!member.dni) missingBase.push("dni");
  if (!member.email) missingBase.push("email");
  if (!member.firstName) missingBase.push("firstName");
  if (!member.lastName) missingBase.push("lastName");
  if (member.status !== 1) missingBase.push("status");

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
    if (!bio || bio.trim().length === 0) missingTranslations[locale] = ["bio"];
  }

  const publishable = missingBase.length === 0 && Object.keys(missingTranslations).length === 0;
  return { publishable, missing: { base: missingBase, translations: missingTranslations } };
}

export async function deleteMember(id: number) {
  await db.deleteFrom("member").where("id", "=", id).execute();
}

export async function updatePassword(email: string, newPassword: string) {
  await db
    .updateTable("member")
    .set({ password: hashPassword(newPassword), resetPassword: 0 })
    .where("email", "=", email)
    .execute();
}

export async function getResetPasswordStatus(email: string) {
  return db.selectFrom("member").select("resetPassword").where("email", "=", email).executeTakeFirst();
}

export async function setResetToken(memberId: number, token: string, expires: string) {
  await db
    .updateTable("member")
    .set({ resetToken: token, resetExpires: expires, resetPassword: 1 })
    .where("id", "=", memberId)
    .execute();
}

export async function getMemberByResetToken(token: string) {
  const now = new Date().toISOString();
  return db
    .selectFrom("member")
    .select(["id", "firstName", "email"])
    .where("resetToken", "=", token)
    .where("resetExpires", ">", now)
    .where("resetPassword", "=", 1)
    .executeTakeFirst();
}

export async function consumeResetToken(memberId: number, newPassword: string) {
  await db
    .updateTable("member")
    .set({ password: hashPassword(newPassword), resetToken: null, resetExpires: null, resetPassword: 0 })
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
  const today = new Date().toISOString().split("T")[0];
  await db.insertInto("member_group").values({ memberId, groupId, createdAt: today, updatedAt: today }).execute();
}

export async function removeMemberFromGroup(memberId: number, groupId: number) {
  await db.deleteFrom("member_group").where("memberId", "=", memberId).where("groupId", "=", groupId).execute();
}
