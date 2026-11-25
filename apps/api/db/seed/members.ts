import { randomBytes } from "node:crypto";

import { env } from "../../config/env.js";
import { hashPassword } from "../../lib/password.js";
import { db } from "../client.js";
import { insertInChunks } from "./chunks.js";
import { seedData } from "./data.js";
import { localeRows, today } from "./rows.js";

export async function memberIdsByEmail(): Promise<Map<string, number>> {
  const emails = seedData.members.map((member) => member.email);
  const rows = await db.selectFrom("member").select(["id", "email"]).where("email", "in", emails).execute();
  return new Map(rows.map((row) => [row.email, row.id]));
}

export async function seedMembers() {
  await insertMembers();
  const ids = await memberIdsByEmail();
  await insertMemberTranslations(ids);
  await insertMemberGroups(ids);
}

async function insertMembers() {
  const existing = new Set((await db.selectFrom("member").select("email").execute()).map((member) => member.email));
  const newMembers = seedData.members.filter((member) => !existing.has(member.email));
  if (newMembers.length === 0) return;

  const password = env.SEED_PASSWORD ?? randomBytes(12).toString("base64url");
  if (env.SEED_PASSWORD === undefined) {
    console.log(`[seed] Seeded members sign in with the generated password: ${password}`);
  }
  const passwordHash = await hashPassword(password);

  await insertInChunks(
    newMembers.map((member) => ({
      dni: `seed-${seedData.members.indexOf(member) + 1}`,
      email: member.email,
      passwordHash,
      firstName: member.firstName,
      lastName: member.lastName,
      maternalName: member.maternalName,
      birthDate: null,
      isActive: member.isActive ? 1 : 0,
      roleCode: member.roleCode,
      memberTypeCode: member.memberTypeCode,
      prefixCode: member.prefixCode,
      genderCode: null,
      createdAt: today,
      updatedAt: today,
    })),
    (chunk) =>
      db
        .insertInto("member")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );
}

async function insertMemberTranslations(ids: Map<string, number>) {
  await insertInChunks(
    seedData.members.flatMap((member) => {
      const memberId = ids.get(member.email);
      if (memberId === undefined) return [];
      return localeRows(member.bio, (locale, bio) => ({ memberId, locale, bio: bio || null }));
    }),
    (chunk) =>
      db
        .insertInto("member_translation")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );
}

async function insertMemberGroups(ids: Map<string, number>) {
  await insertInChunks(
    [...ids.values()].map((memberId) => ({
      memberId,
      groupId: seedData.group.id,
      createdAt: today,
      updatedAt: today,
    })),
    (chunk) =>
      db
        .insertInto("member_group")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );
}
