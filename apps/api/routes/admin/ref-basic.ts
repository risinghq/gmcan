import { Hono } from "hono";
import { z } from "zod";

import { okStatus } from "../../lib/contracts.js";
import { notFound } from "../../lib/errors/app-error.js";
import { validate } from "../../lib/validate.js";
import {
  getEventPublicationDependencyCount,
  getJournalPublicationDependencyCount,
} from "../../services/publication.service.js";
import {
  createJournal,
  deleteJournal,
  getJournal,
  listCurrencies,
  listFundingSources,
  listGenders,
  listJournals,
  listPrefixes,
  listRoles,
  updateJournal,
} from "../../services/ref.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const JournalBody = z.object({ name: z.string().min(1) });

router.get("/gender", async (c) => c.json(await listGenders()));
router.get("/prefix", async (c) => c.json(await listPrefixes()));
router.get("/role", async (c) => c.json(await listRoles()));
router.get("/funding-source", async (c) => c.json(await listFundingSources()));
router.get("/currency", async (c) => c.json(await listCurrencies()));

router.get("/journal", async (c) => c.json(await listJournals()));
router.get("/journal/:id", validate("param", IdParam), async (c) => {
  const row = await getJournal(c.req.valid("param").id);
  if (!row) throw notFound();
  return c.json(row);
});
router.post("/journal", validate("json", JournalBody), async (c) => {
  return c.json({ id: await createJournal(c.req.valid("json")) }, 201);
});
router.put("/journal/:id", validate("param", IdParam), validate("json", JournalBody), async (c) => {
  await updateJournal(c.req.valid("param").id, c.req.valid("json"));
  return c.json(okStatus());
});
router.delete("/journal/:id", validate("param", IdParam), async (c) => {
  await deleteJournal(c.req.valid("param").id);
  return c.json(okStatus());
});

router.get("/journal/:id/dependencies", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const journalArticle = await getJournalPublicationDependencyCount(id);
  return c.json({
    total: journalArticle,
    byKind: { journalArticle, conferencePaper: 0, thesis: 0 },
    canDelete: journalArticle === 0,
  });
});

router.get("/event/:id/dependencies", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const conferencePaper = await getEventPublicationDependencyCount(id);
  return c.json({
    total: conferencePaper,
    byKind: { journalArticle: 0, conferencePaper, thesis: 0 },
    canDelete: conferencePaper === 0,
  });
});

export default router;
