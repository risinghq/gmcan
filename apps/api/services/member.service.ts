import type {
  AdminMember,
  AuthorCandidate,
  MemberCreate,
  MemberProfileWrite,
  MemberWrite,
} from "@gmcan/contracts/admin";
import type { Compilable, Expression, RawBuilder, SqlBool } from "kysely";

import { atomic, db, insertedId, lastInsertId, queryInChunks, readBatch } from "../db/client.js";
import type { MemberTypeCode } from "../db/schema.js";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../lib/locales.js";
import { hashPassword } from "../lib/password.js";
import { type Locale } from "../lib/public-locale.js";
import type { AdminMemberListItem } from "./admin-list.types.js";
import { memberFullName, resolveMemberPhotoView, resolveMemberPhotoViews } from "./member-photo.service.js";
import { publicLocalizedMemberSelectQuery } from "./member-read-model.js";
import { listProjectsLocalized } from "./project.service.js";
import { listPublications } from "./publication.service.js";

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
  const translationRows = await queryInChunks(memberIds, (chunk) =>
    db
      .selectFrom("member_translation")
      .select(["memberId", "locale", "bio"])
      .where("memberId", "in", chunk)
      .where("locale", "in", SUPPORTED_LOCALES)
      .execute(),
  );

  const translationsByMember = new Map<number, Map<string, string | null>>();
  for (const tr of translationRows) {
    if (!translationsByMember.has(tr.memberId)) translationsByMember.set(tr.memberId, new Map());
    translationsByMember.get(tr.memberId)!.set(tr.locale, tr.bio);
  }

  const photos = await resolveMemberPhotoViews(
    rows.map((row) => ({ memberId: row.id, fullName: memberFullName(row) })),
    locale,
  );

  return rows.map((row) => {
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
      photoUrl: photos.get(row.id)!.photoUrl,
      photoAlt: photos.get(row.id)!.photoAlt,
      publishability: {
        publishable: missingBase.length === 0 && Object.keys(missingTranslations).length === 0,
        missing: { base: missingBase, translations: missingTranslations },
      },
    };
  });
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
    ])
    .where("member.id", "=", id)
    .executeTakeFirst();
}

/** Sign-in and password reset use this read. It is the only read that returns `passwordHash`. */
export async function getMemberByEmail(email: string) {
  return db
    .selectFrom("member")
    .select(["id", "firstName", "isActive", "roleCode", "passwordHash"])
    .where("email", "=", email)
    .executeTakeFirst();
}

export async function getMemberProfileLocalized(id: number, locale: Locale) {
  const [member, projects, publications] = await Promise.all([
    publicLocalizedMemberSelectQuery(locale).where("member.id", "=", id).executeTakeFirst(),
    listProjectsLocalized(locale, undefined, id),
    listPublications(locale, { memberId: id }),
  ]);
  return { member, projects, publications };
}

export async function searchAuthorPool(q: string, locale: Locale = DEFAULT_LOCALE): Promise<AuthorCandidate[]> {
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

  const photos = await resolveMemberPhotoViews(
    members.map((m) => ({ memberId: m.id, fullName: memberFullName(m) })),
    locale,
  );
  const registered = members.map((m): AuthorCandidate => {
    const { photoUrl, photoAlt } = photos.get(m.id)!;
    return { kind: "registered", memberId: m.id, name: memberFullName(m), photoUrl, photoAlt };
  });
  const external = externals.flatMap(({ externalName }): AuthorCandidate[] =>
    externalName === null ? [] : [{ kind: "external", name: externalName }],
  );
  return [...registered, ...external];
}

export async function memberExists(id: number) {
  return !!(await db.selectFrom("member").select("id").where("id", "=", id).executeTakeFirst());
}

export async function verifyEmailExists(email: string) {
  return db.selectFrom("member").select("id").where("email", "=", email).executeTakeFirst();
}

/** Every locale's bio, keyed by locale. An empty bio is stored as null. */
function memberTranslationRows(memberId: number | RawBuilder<number>, translations: MemberWrite["translations"]) {
  return db
    .insertInto("member_translation")
    .values(Object.entries(translations).map(([locale, tr]) => ({ memberId, locale, bio: tr.bio || null })));
}

function profileRow(data: MemberProfileWrite) {
  return {
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    maternalName: data.maternalName || null,
    birthDate: data.birthDate || null,
    prefixCode: data.prefixCode,
    genderCode: data.genderCode,
  };
}

function adminRow(data: MemberWrite) {
  return { ...profileRow(data), isActive: data.isActive, roleCode: data.roleCode, memberTypeCode: data.memberTypeCode };
}

export async function getAdminMember(id: number, locale: Locale): Promise<AdminMember | undefined> {
  const [members, translations] = await readBatch([
    db
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
      ])
      .where("id", "=", id),
    db.selectFrom("member_translation").select(["locale", "bio"]).where("memberId", "=", id),
  ]);
  const member = members[0];
  if (!member) return undefined;

  const bios = new Map(translations.map((tr) => [tr.locale, tr.bio ?? ""]));
  const photo = await resolveMemberPhotoView({ memberId: id, fullName: memberFullName(member), locale });
  return {
    ...member,
    isActive: member.isActive === 1 ? 1 : 0,
    translations: Object.fromEntries(SUPPORTED_LOCALES.map((code) => [code, { bio: bios.get(code) ?? "" }])),
    ...photo,
  };
}

export async function createMember(data: MemberCreate) {
  const now = new Date().toISOString();
  const memberId = lastInsertId("member");
  const results = await atomic([
    db.insertInto("member").values({
      ...adminRow(data),
      dni: data.dni,
      passwordHash: await hashPassword(data.password),
      createdAt: now,
      updatedAt: now,
    }),
    memberTranslationRows(memberId, data.translations),
  ]);
  return insertedId(results, 0);
}

export async function updateMember(id: number, data: MemberWrite) {
  await atomic([
    db
      .updateTable("member")
      .set({ ...adminRow(data), updatedAt: new Date().toISOString() })
      .where("id", "=", id),
    db.deleteFrom("member_translation").where("memberId", "=", id),
    memberTranslationRows(id, data.translations),
  ]);
}

/** A member's own write: it cannot reach the role, the active flag, the type or the DNI. */
export async function updateMemberProfile(id: number, data: MemberProfileWrite) {
  await atomic([
    db
      .updateTable("member")
      .set({ ...profileRow(data), updatedAt: new Date().toISOString() })
      .where("id", "=", id),
    db.deleteFrom("member_translation").where("memberId", "=", id),
    memberTranslationRows(id, data.translations),
  ]);
}

export async function getMemberPublishability(id: number): Promise<MemberPublishability> {
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

export async function deleteMember(id: number) {
  await db.deleteFrom("member").where("id", "=", id).execute();
}

/**
 * The queries that change a password, end the member's sessions and spend their reset token, so
 * neither a stolen session nor an emailed link outlives the password. `keepSessionId` spares the
 * session that made the change. `guard` makes every query apply only while it holds, so a batch
 * that lost a race changes nothing. The password update comes first: its affected-row count says
 * whether the guard held. The reset row goes last because the guard may read it.
 */
export async function passwordChangeQueries(
  memberId: number,
  newPassword: string,
  options: { keepSessionId?: string; guard?: Expression<SqlBool> } = {},
): Promise<Compilable[]> {
  const { keepSessionId, guard } = options;
  return [
    db
      .updateTable("member")
      .set({ passwordHash: await hashPassword(newPassword), updatedAt: new Date().toISOString() })
      .where("id", "=", memberId)
      .$if(guard !== undefined, (qb) => qb.where(guard as Expression<SqlBool>)),
    db
      .deleteFrom("session")
      .where("memberId", "=", memberId)
      .$if(keepSessionId !== undefined, (qb) => qb.where("id", "!=", keepSessionId as string))
      .$if(guard !== undefined, (qb) => qb.where(guard as Expression<SqlBool>)),
    db
      .deleteFrom("password_reset")
      .where("memberId", "=", memberId)
      .$if(guard !== undefined, (qb) => qb.where(guard as Expression<SqlBool>)),
  ];
}

export async function updatePassword(memberId: number, newPassword: string, keepSessionId?: string) {
  await atomic(await passwordChangeQueries(memberId, newPassword, { keepSessionId }));
}

export async function listMemberGroups(memberId: number) {
  return db.selectFrom("member_group").selectAll().where("memberId", "=", memberId).execute();
}

export async function addMemberToGroup(memberId: number, groupId: number) {
  const now = new Date().toISOString();
  await db.insertInto("member_group").values({ memberId, groupId, createdAt: now, updatedAt: now }).execute();
}

export async function removeMemberFromGroup(memberId: number, groupId: number) {
  await db.deleteFrom("member_group").where("memberId", "=", memberId).where("groupId", "=", groupId).execute();
}
