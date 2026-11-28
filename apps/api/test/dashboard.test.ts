import { afterAll, beforeAll, expect, test } from "bun:test";

import { db } from "../db/client.js";
import { getDashboardSummary } from "../services/dashboard.service.js";

const EMAILS = ["dashboard.active@example.test", "dashboard.inactive@example.test"];

async function insertMember(dni: string, email: string, isActive: number) {
  await db
    .insertInto("member")
    .values({
      dni,
      email,
      passwordHash: "x",
      firstName: "Dashboard",
      lastName: "Member",
      maternalName: null,
      birthDate: null,
      isActive,
      roleCode: "researcher",
      memberTypeCode: "researcher",
      prefixCode: null,
      genderCode: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    })
    .execute();
}

async function researcherCount() {
  const { membersByType } = await getDashboardSummary();
  return membersByType.find((item) => item.code === "researcher")?.count ?? 0;
}

beforeAll(() => db.deleteFrom("member").where("email", "in", EMAILS).execute());
afterAll(() => db.deleteFrom("member").where("email", "in", EMAILS).execute());

test("the dashboard counts active members only", async () => {
  const before = await researcherCount();

  await insertMember("90000001", EMAILS[0]!, 1);
  await insertMember("90000002", EMAILS[1]!, 0);

  expect(await researcherCount()).toBe(before + 1);
});
