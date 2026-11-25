import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import type { AdminProject, ProjectTranslation, ProjectWrite } from "@gmcan/contracts/admin";

import { app } from "../app.js";
import { db } from "../db/client.js";
import { storedPasswordHash } from "./fixtures.js";

const PASSWORD = "correct horse battery";
const ADMIN = "projects.admin@example.test";
const SEEDED_AT = "2026-01-01T00:00:00.000Z";

let admin = "";
let groupId = 0;
let researchLineId = 0;
let adminId = 0;
let memberId = 0;

function send(method: string, path: string, body?: unknown) {
  return app.request(path, {
    method,
    headers: { "content-type": "application/json", cookie: admin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function text(title: string): ProjectTranslation {
  return { title, description: `${title} description` };
}

let codes = 0;

function write(overrides: Partial<ProjectWrite> = {}): ProjectWrite {
  codes += 1;
  return {
    code: `PRJ-ADMIN-${codes}`,
    fundedAmountMinor: 150000,
    statusCode: "active",
    startDate: "2026-03-01",
    endDate: null,
    researchLineId,
    currencyCode: "pen",
    fundingSourceCode: "vrip",
    memberIds: [adminId],
    translations: { es: text("Proyecto"), en: text("Project") },
    ...overrides,
  };
}

async function create(body: ProjectWrite): Promise<number> {
  const res = await send("POST", "/admin/projects", body);
  expect(res.status).toBe(201);
  return ((await res.json()) as { id: number }).id;
}

async function read(id: number): Promise<AdminProject> {
  const res = await send("GET", `/admin/projects/${id}`);
  expect(res.status).toBe(200);
  return (await res.json()) as AdminProject;
}

async function insertMember(dni: string, email: string, firstName: string, roleCode: "administrator" | "researcher") {
  const row = await db
    .insertInto("member")
    .values({
      dni,
      email,
      passwordHash: await storedPasswordHash(PASSWORD),
      firstName,
      lastName: "Projects",
      maternalName: null,
      birthDate: null,
      isActive: 1,
      roleCode,
      memberTypeCode: "researcher",
      prefixCode: null,
      genderCode: null,
      createdAt: SEEDED_AT,
      updatedAt: SEEDED_AT,
    })
    .executeTakeFirstOrThrow();
  return Number(row.insertId);
}

beforeAll(async () => {
  adminId = await insertMember("40000601", ADMIN, "Admin", "administrator");
  memberId = await insertMember("40000602", "projects.member@example.test", "Member", "researcher");

  const group = await db
    .insertInto("research_group")
    .values({
      slug: "projects-test",
      shortName: "PT",
      fullName: "Projects Test",
      createdAt: SEEDED_AT,
      updatedAt: SEEDED_AT,
    })
    .executeTakeFirstOrThrow();
  groupId = Number(group.insertId);

  const login = await app.request("/admin/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: ADMIN, password: PASSWORD }),
  });
  expect(login.status).toBe(200);
  admin = login.headers.get("set-cookie")!.split(";")[0]!;

  const line = await send("POST", "/admin/research-lines", {
    groupId,
    translations: { es: { name: "Línea" }, en: { name: "Line" } },
  });
  expect(line.status).toBe(201);
  researchLineId = ((await line.json()) as { id: number }).id;
});

afterAll(async () => {
  await db.deleteFrom("project").where("researchLineId", "=", researchLineId).execute();
  await db.deleteFrom("research_group").where("id", "=", groupId).execute();
  await db.deleteFrom("member").where("id", "in", [adminId, memberId]).execute();
});

describe("admin projects", () => {
  test("a created project reads back with every locale and its members", async () => {
    const body = write({ memberIds: [adminId, memberId] });
    const id = await create(body);

    const project = await read(id);
    expect(project).toMatchObject({
      id,
      code: body.code,
      fundedAmountMinor: 150000,
      statusCode: "active",
      startDate: "2026-03-01",
      endDate: null,
      researchLineId,
      currencyCode: "pen",
      fundingSourceCode: "vrip",
      translations: body.translations,
    });
    expect(project.memberIds.toSorted()).toEqual([adminId, memberId].toSorted());
  });

  test("an update replaces the translations and the membership", async () => {
    const id = await create(write({ memberIds: [adminId] }));
    const changed = write({
      statusCode: "completed",
      endDate: "2026-09-30",
      memberIds: [memberId],
      translations: { es: text("Cambiado"), en: text("Changed") },
    });

    expect((await send("PUT", `/admin/projects/${id}`, changed)).status).toBe(200);

    const project = await read(id);
    expect(project).toMatchObject({ statusCode: "completed", endDate: "2026-09-30", memberIds: [memberId] });
    expect(project.translations).toEqual(changed.translations);
  });

  test("reactivating a project clears its end date", async () => {
    const id = await create(write({ statusCode: "completed", endDate: "2026-09-30" }));

    expect((await send("PUT", `/admin/projects/${id}`, write({ statusCode: "active", endDate: null }))).status).toBe(
      200,
    );

    expect(await read(id)).toMatchObject({ statusCode: "active", endDate: null });
  });

  test("the public listing shows the project in the reader's locale with its members", async () => {
    const body = write({ memberIds: [memberId] });
    const id = await create(body);

    const res = await app.request("/api/projects", { headers: { "accept-language": "en" } });
    expect(res.status).toBe(200);
    const listed = (
      (await res.json()) as Array<{ id: number; title: string; members: Array<{ memberId: number }> }>
    ).find((project) => project.id === id);
    expect(listed?.title).toBe("Project");
    expect(listed?.members.map((member) => member.memberId)).toEqual([memberId]);
  });

  test("refuses a project without every locale or with an empty title", async () => {
    const missing = await send("POST", "/admin/projects", write({ translations: { es: text("Proyecto") } }));
    expect(missing.status).toBe(400);

    const blank = await send(
      "POST",
      "/admin/projects",
      write({ translations: { es: text("Proyecto"), en: { ...text("Project"), title: " " } } }),
    );
    expect(blank.status).toBe(400);
  });

  test("a deleted project is not found", async () => {
    const id = await create(write());

    expect((await send("DELETE", `/admin/projects/${id}`)).status).toBe(200);
    expect((await send("GET", `/admin/projects/${id}`)).status).toBe(404);
  });

  test("an anonymous request may not write", async () => {
    const res = await app.request("/admin/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(write()),
    });
    expect(res.status).toBe(401);
  });
});
