import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { app } from "../app.js";
import { db } from "../db/client.js";
import { hashPassword } from "../lib/password.js";

const PASSWORD = "correct horse battery";
const ADMIN = "create.admin@example.test";
const SEEDED_AT = "2026-01-01T00:00:00.000Z";

let admin = "";
let groupId = 0;
let eventId = 0;

function send(method: string, path: string, body?: unknown) {
  return app.request(path, {
    method,
    headers: { "content-type": "application/json", cookie: admin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function created(res: Response): Promise<number> {
  expect(res.status).toBe(201);
  const { id } = (await res.json()) as { id: number };
  return id;
}

async function read<T>(path: string): Promise<T> {
  const res = await send("GET", path);
  expect(res.status).toBe(200);
  return (await res.json()) as T;
}

interface Stamped {
  createdAt: string;
  updatedAt: string;
}

function publicationBody(title: string) {
  return {
    data: {
      publishedAt: "2026-05-01",
      subtype: { kindCode: "conference_paper", conferencePaper: { eventId } },
      translations: { es: { title }, en: { title } },
    },
    authors: [{ kind: "external", externalName: "Ana Torres", authorOrder: 1 }],
  };
}

function researchLineBody(lineGroupId: number) {
  return { groupId: lineGroupId, translations: { es: { name: "Visión" }, en: { name: "Vision" } } };
}

beforeAll(async () => {
  await db
    .insertInto("member")
    .values({
      dni: "40000101",
      email: ADMIN,
      passwordHash: await hashPassword(PASSWORD),
      firstName: "Create",
      lastName: "Admin",
      maternalName: null,
      birthDate: null,
      isActive: 1,
      roleCode: "administrator",
      memberTypeCode: "researcher",
      prefixCode: null,
      genderCode: null,
      createdAt: SEEDED_AT,
      updatedAt: SEEDED_AT,
    })
    .execute();
  const group = await db
    .insertInto("research_group")
    .values({
      slug: "create-test",
      shortName: "CT",
      fullName: "Create Test",
      createdAt: SEEDED_AT,
      updatedAt: SEEDED_AT,
    })
    .executeTakeFirstOrThrow();
  groupId = Number(group.insertId);
  const event = await db.insertInto("event").defaultValues().executeTakeFirstOrThrow();
  eventId = Number(event.insertId);

  const login = await app.request("/admin/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: ADMIN, password: PASSWORD }),
  });
  expect(login.status).toBe(200);
  admin = login.headers.get("set-cookie")!.split(";")[0]!;
});

// Every test file shares one database, and other files clear tables such as event,
// so remove the rows that hold restrict references before they run.
afterAll(async () => {
  const papers = db.selectFrom("conference_paper").select("publicationId").where("eventId", "=", eventId);
  await db.deleteFrom("publication").where("id", "in", papers).execute();
  const lines = db.selectFrom("research_line").select("id").where("groupId", "=", groupId);
  await db.deleteFrom("project").where("researchLineId", "in", lines).execute();
  await db.deleteFrom("research_group").where("id", "=", groupId).execute();
  await db.deleteFrom("event").where("id", "=", eventId).execute();
  await db.deleteFrom("member").where("email", "=", ADMIN).execute();
});

describe("admin create", () => {
  test("stores a research line", async () => {
    const id = await created(await send("POST", "/admin/research-lines", researchLineBody(groupId)));

    const line = await read<{ translations: Record<string, { name: string }> }>(`/admin/research-lines/${id}`);
    expect(line.translations.en?.name).toBe("Vision");
  });

  test("stores a method", async () => {
    const id = await created(
      await send("POST", "/admin/methods", {
        groupId,
        translations: { es: { name: "Método", description: "Uno" }, en: { name: "Method", description: "One" } },
      }),
    );

    const method = await read<{ translations: Record<string, { name: string }> }>(`/admin/methods/${id}`);
    expect(method.translations.es?.name).toBe("Método");
  });

  test("stores software", async () => {
    const id = await created(
      await send("POST", "/admin/group/software", {
        groupId,
        translations: { es: { name: "Analizador" }, en: { name: "Analyzer" } },
        moreInfo: "https://example.test/analyzer",
      }),
    );

    const listed = await read<Array<{ id: number }>>(`/admin/group/${groupId}/software`);
    expect(listed.map((s) => s.id)).toContain(id);
    const software = await read<{ moreInfo: string; translations: Record<string, { name: string }> }>(
      `/admin/group/software/${id}`,
    );
    expect(software.moreInfo).toBe("https://example.test/analyzer");
    expect(software.translations.en?.name).toBe("Analyzer");
  });

  test("an unknown software or equipment item is not_found", async () => {
    expect((await send("GET", "/admin/group/software/999999")).status).toBe(404);
    expect((await send("GET", "/admin/group/equipment/999999")).status).toBe(404);
  });

  test("rejects software without a name, which the database requires", async () => {
    const res = await send("POST", "/admin/group/software", {
      groupId,
      translations: { es: { description: "Sin nombre" }, en: { description: "No name" } },
    });
    expect(res.status).toBe(400);
  });

  test("stores a project", async () => {
    const researchLineId = await created(await send("POST", "/admin/research-lines", researchLineBody(groupId)));
    await created(
      await send("POST", "/admin/projects", {
        code: "PRJ-CREATE-1",
        fundedAmountMinor: 150000,
        startDate: "2026-03-01",
        researchLineId,
        currencyCode: "pen",
        fundingSourceCode: "vrip",
        translations: {
          es: { title: "Proyecto", description: "Descripción" },
          en: { title: "Project", description: "Description" },
        },
      }),
    );

    const projects = await read<Array<{ code: string }>>("/admin/projects?q=PRJ-CREATE-1");
    expect(projects.map((p) => p.code)).toContain("PRJ-CREATE-1");
  });

  test("stores a conference paper", async () => {
    const id = await created(
      await send("POST", "/admin/publications", {
        data: {
          publishedAt: "2026-05-01",
          subtype: { kindCode: "conference_paper", conferencePaper: { eventId } },
          translations: { es: { title: "Ponencia" }, en: { title: "Paper" } },
        },
        authors: [{ kind: "external", externalName: "Ana Torres", authorOrder: 1 }],
      }),
    );

    const { publication, authors } = await read<{
      publication: { translations: Record<string, { title: string }> };
      authors: Array<{ kind: string; name: string; authorOrder: number }>;
    }>(`/admin/publications/${id}`);
    expect(publication.translations.en?.title).toBe("Paper");
    expect(authors).toEqual([{ kind: "external", authorOrder: 1, name: "Ana Torres" }]);
  });
});

describe("admin delete", () => {
  test("refuses to delete a research line a project still uses, and keeps the line", async () => {
    const researchLineId = await created(await send("POST", "/admin/research-lines", researchLineBody(groupId)));
    await created(
      await send("POST", "/admin/projects", {
        code: "PRJ-DELETE-1",
        fundedAmountMinor: 0,
        startDate: "2026-03-01",
        researchLineId,
        currencyCode: "pen",
        fundingSourceCode: "vrip",
        translations: { es: { title: "Proyecto", description: "D" }, en: { title: "Project", description: "D" } },
      }),
    );

    const res = await send("DELETE", `/admin/research-lines/${researchLineId}`);
    expect(res.status).toBe(409);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe("conflict");
    expect((await send("GET", `/admin/research-lines/${researchLineId}`)).status).toBe(200);
  });

  test("deletes a research line no project uses", async () => {
    const id = await created(await send("POST", "/admin/research-lines", researchLineBody(groupId)));

    expect((await send("DELETE", `/admin/research-lines/${id}`)).status).toBe(200);
    expect((await send("GET", `/admin/research-lines/${id}`)).status).toBe(404);
  });
});

describe("admin update", () => {
  test("stores equipment edits and moves updatedAt", async () => {
    const id = await created(await send("POST", "/admin/group/equipment", { groupId, name: "Workstation" }));
    await db.updateTable("equipment").set({ updatedAt: SEEDED_AT }).where("id", "=", id).execute();

    const res = await send("PUT", `/admin/group/equipment/${id}`, { name: "Workstation 2", gpu: "RTX" });
    expect(res.status).toBe(200);

    const equipment = await read<Stamped & { name: string; gpu: string }>(`/admin/group/equipment/${id}`);
    expect(equipment).toMatchObject({ name: "Workstation 2", gpu: "RTX" });
    expect(equipment.updatedAt > SEEDED_AT).toBe(true);
  });

  test("stores research line translations for every locale", async () => {
    const id = await created(await send("POST", "/admin/research-lines", researchLineBody(groupId)));

    const res = await send("PUT", `/admin/research-lines/${id}`, {
      translations: { es: { name: "Robótica", description: "Brazos" }, en: { name: "Robotics", description: "Arms" } },
    });
    expect(res.status).toBe(200);

    const line = await read<{ translations: Record<string, { name: string; description: string }> }>(
      `/admin/research-lines/${id}`,
    );
    expect(line.translations).toEqual({
      es: { name: "Robótica", description: "Brazos" },
      en: { name: "Robotics", description: "Arms" },
    });
  });

  test("rejects a translated write that leaves out a supported locale", async () => {
    const id = await created(await send("POST", "/admin/research-lines", researchLineBody(groupId)));

    const res = await send("PUT", `/admin/research-lines/${id}`, { translations: { es: { name: "Solo español" } } });
    expect(res.status).toBe(400);
  });

  test("stores publication edits and moves updatedAt", async () => {
    const id = await created(await send("POST", "/admin/publications", publicationBody("Antes")));
    await db.updateTable("publication").set({ updatedAt: SEEDED_AT }).where("id", "=", id).execute();

    const res = await send("PUT", `/admin/publications/${id}`, publicationBody("Después"));
    expect(res.status).toBe(200);

    const { publication } = await read<{ publication: Stamped & { translations: Record<string, { title: string }> } }>(
      `/admin/publications/${id}`,
    );
    expect(publication.translations.es?.title).toBe("Después");
    expect(publication.updatedAt > SEEDED_AT).toBe(true);
  });
});
