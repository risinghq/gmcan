import { Hono } from "hono";
import { z } from "zod";

import { translationsSchema } from "../../lib/admin-translations.js";
import { okStatus } from "../../lib/contracts.js";
import { notFound } from "../../lib/errors/app-error.js";
import { validate } from "../../lib/validate.js";
import { getUniversityPublicationDependencyCount } from "../../services/publication.service.js";
import {
  createUniversity,
  deleteUniversity,
  getUniversityTranslations,
  listMemberTypeTranslations,
  listNewsKindTranslations,
  listPublicationKindTranslations,
  listThesisKindTranslations,
  listUniversityTranslations,
  updateUniversity,
} from "../../services/ref.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const NamedTranslationBody = z.object({
  translations: translationsSchema({ name: z.string().min(1) }),
});

router.get("/member-type", async (c) => c.json(await listMemberTypeTranslations()));
router.get("/publication-kind", async (c) => c.json(await listPublicationKindTranslations()));
router.get("/thesis-kind", async (c) => c.json(await listThesisKindTranslations()));
router.get("/news-kind", async (c) => c.json(await listNewsKindTranslations()));
router.get("/university", async (c) => c.json(await listUniversityTranslations()));

router.get("/university/:id", validate("param", IdParam), async (c) => {
  const university = await getUniversityTranslations(c.req.valid("param").id);
  if (!university) throw notFound();
  return c.json(university);
});

router.post("/university", validate("json", NamedTranslationBody), async (c) => {
  const { translations } = c.req.valid("json");
  return c.json({ id: await createUniversity(translations) }, 201);
});

router.put("/university/:id", validate("param", IdParam), validate("json", NamedTranslationBody), async (c) => {
  await updateUniversity(c.req.valid("param").id, c.req.valid("json").translations);
  return c.json(okStatus());
});

router.delete("/university/:id", validate("param", IdParam), async (c) => {
  await deleteUniversity(c.req.valid("param").id);
  return c.json(okStatus());
});

router.get("/university/:id/dependencies", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const thesis = await getUniversityPublicationDependencyCount(id);
  return c.json({
    total: thesis,
    byKind: { journalArticle: 0, conferencePaper: 0, thesis },
    canDelete: thesis === 0,
  });
});

export default router;
