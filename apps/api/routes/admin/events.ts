import { Hono } from "hono";
import { z } from "zod";

import { translationsSchema } from "../../lib/admin-translations.js";
import { notFound } from "../../lib/errors/app-error.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "../../middleware/authz.js";
import {
  createEvent,
  deleteEvent,
  getEventTranslations,
  listAdminEvents,
  updateEvent,
} from "../../services/event.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

const EventTranslationPayload = z.object({
  name: z.string().min(1),
  city: z.string().trim().min(1).nullable().default(null),
  country: z.string().trim().min(1).nullable().default(null),
});

const EventBody = z.object({
  translations: translationsSchema(EventTranslationPayload.shape),
});

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("refs.read")(c, next);
  return requirePermission("refs.write")(c, next);
});

router.get("/", async (c) => {
  return c.json(await listAdminEvents(c.get("locale")));
});

router.get("/:id", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const event = await getEventTranslations(id);
  if (!event) throw notFound();
  return c.json(event);
});

router.post("/", validate("json", EventBody), async (c) => {
  const { translations } = c.req.valid("json");
  return c.json({ id: await createEvent(translations) }, 201);
});

router.put("/:id", validate("param", IdParam), validate("json", EventBody), async (c) => {
  const { id } = c.req.valid("param");
  const { translations } = c.req.valid("json");
  await updateEvent(id, translations);
  return c.json({ status: 1 });
});

router.delete("/:id", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteEvent(id);
  return c.json({ status: 1 });
});

export default router;
