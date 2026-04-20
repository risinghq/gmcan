import { sql } from "kysely";

import { db } from "../db/client.js";
import { MEMBER_ACTIVE, MEMBER_NAME, MEMBER_PUBLIC } from "../db/projections.js";
import { publicProfile } from "../db/views.js";
import { hashPassword } from "../lib/password.js";

export async function listMembers() {
  return db.selectFrom("member").select(MEMBER_PUBLIC).execute();
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
    .select([
      "id",
      "dni",
      "email",
      "firstName",
      "lastName",
      "maternalName",
      "birthDate",
      "bio",
      "bioEN",
      "photo",
      "status",
      "roleId",
      "memberTypeId",
      "prefixId",
      "genderId",
    ])
    .where("id", "=", id)
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
      .select(["id", "firstName", "lastName", "maternalName", "photo"])
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

  return [
    ...members.map((m) => ({
      kind: "registered" as const,
      memberId: m.id,
      name: `${m.firstName} ${m.lastName}${m.maternalName ? " " + m.maternalName : ""}`.trim(),
      photo: m.photo ?? null,
    })),
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
  bio?: string;
  bioEN?: string;
  status: number;
  roleId: number;
  memberTypeId: number;
  prefixId?: number;
  genderId?: number;
}) {
  const { password, ...rest } = data;
  const today = new Date().toISOString().split("T")[0];
  const result = await db
    .insertInto("member")
    .values({
      ...rest,
      password: hashPassword(password),
      resetPassword: 0,
      createdAt: today,
      updatedAt: today,
    })
    .executeTakeFirst();
  return Number(result.insertId);
}

export async function updateMember(
  id: number,
  data: {
    email: string;
    firstName: string;
    lastName: string;
    maternalName?: string;
    birthDate?: string;
    bio?: string;
    bioEN?: string;
    status: number;
    roleId: number;
    memberTypeId: number;
    prefixId?: number;
    genderId?: number;
  },
) {
  const today = new Date().toISOString().split("T")[0];
  await db
    .updateTable("member")
    .set({ ...data, updatedAt: today })
    .where("id", "=", id)
    .execute();
}

export async function deleteMember(id: number) {
  await db.deleteFrom("member").where("id", "=", id).execute();
}

export async function getMemberPhoto(id: number) {
  return db.selectFrom("member").select("photo").where("id", "=", id).executeTakeFirst();
}

export async function setMemberPhoto(id: number, photo: string) {
  await db.updateTable("member").set({ photo }).where("id", "=", id).execute();
}

export async function clearMemberPhoto(id: number) {
  await db.updateTable("member").set({ photo: null }).where("id", "=", id).execute();
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
  return db
    .selectFrom("member")
    .select(["id", "firstName", "email"])
    .where("resetToken", "=", token)
    .where("resetExpires", ">", sql<string>`datetime('now')`)
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
