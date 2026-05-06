import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../../db/client.js";
import { okStatus } from "../../lib/contracts.js";
import { getEventPublicationDependencyCount, getJournalPublicationDependencyCount } from "../../services/publication.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const JournalBody = z.object({ name: z.string().min(1) });

router.get("/gender", async (c) => c.json(await db.selectFrom("gender").select(["code", "name"]).execute()));
router.get("/prefix", async (c) => c.json(await db.selectFrom("prefix").select(["code", "label"]).execute()));
router.get("/role", async (c) => c.json(await db.selectFrom("role").select(["code", "name"]).execute()));
router.get("/funding-source", async (c) =>
  c.json(await db.selectFrom("funding_source").select(["code", "name"]).execute()),
);
router.get("/currency", async (c) => c.json(await db.selectFrom("currency").select(["code", "symbol"]).execute()));

router.get("/journal", async (c) => c.json(await db.selectFrom("journal").selectAll().execute()));
router.get("/journal/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("journal").selectAll().where("id", "=", id).executeTakeFirst();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
router.post("/journal", zValidator("json", JournalBody), async (c) => {
  const result = await db.insertInto("journal").values(c.req.valid("json")).executeTakeFirstOrThrow();
  return c.json({ id: Number(result.insertId) }, 201);
});
router.put("/journal/:id", zValidator("param", IdParam), zValidator("json", JournalBody), async (c) => {
  const { id } = c.req.valid("param");
  await db.updateTable("journal").set(c.req.valid("json")).where("id", "=", id).execute();
  return c.json(okStatus());
});
router.delete("/journal/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("journal").where("id", "=", id).execute();
  return c.json(okStatus());
});

router.get("/journal/:id/dependencies", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const journalArticle = await getJournalPublicationDependencyCount(id);
  return c.json({
    total: journalArticle,
    byKind: { journalArticle, conferencePaper: 0, thesis: 0 },
    canDelete: journalArticle === 0,
  });
});

router.get("/event/:id/dependencies", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const conferencePaper = await getEventPublicationDependencyCount(id);
  return c.json({
    total: conferencePaper,
    byKind: { journalArticle: 0, conferencePaper, thesis: 0 },
    canDelete: conferencePaper === 0,
  });
});

export default router;
