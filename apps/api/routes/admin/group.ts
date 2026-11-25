import {
  AboutTranslationSchema,
  EquipmentFieldsSchema,
  GroupFieldsSchema,
  GroupTranslationSchema,
  SoftwareTranslationSchema,
} from "@gmcan/contracts/admin";
import { Hono } from "hono";
import { z } from "zod";

import { translationsSchema } from "../../lib/admin-translations.js";
import { okStatus } from "../../lib/contracts.js";
import { notFound } from "../../lib/errors/app-error.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "../../middleware/authz.js";
import {
  createEquipment,
  createSoftware,
  deleteEquipment,
  deleteSoftware,
  getEquipment,
  getSoftware,
  listAdminAbout,
  listAdminGroups,
  listEquipment,
  listSoftware,
  toAdminSoftwareViews,
  updateAbout,
  updateEquipment,
  updateGroup,
  updateSoftware,
} from "../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const GroupBody = GroupFieldsSchema.extend({ translations: translationsSchema(GroupTranslationSchema.shape) });
const AboutBody = z.object({ translations: translationsSchema(AboutTranslationSchema.shape) });

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("content.read")(c, next);
  return requirePermission("content.write")(c, next);
});

router.get("/", async (c) => c.json(await listAdminGroups()));

router.put("/:id", validate("param", IdParam), validate("json", GroupBody), async (c) => {
  if (!(await updateGroup(c.req.valid("param").id, c.req.valid("json")))) throw notFound();
  return c.json(okStatus());
});

router.get("/:id/about", validate("param", IdParam), async (c) => {
  return c.json(await listAdminAbout(c.req.valid("param").id));
});

router.put("/about/:id", validate("param", IdParam), validate("json", AboutBody), async (c) => {
  if (!(await updateAbout(c.req.valid("param").id, c.req.valid("json")))) throw notFound();
  return c.json(okStatus());
});

const GroupIdParam = z.object({ groupId: z.coerce.number().int().positive() });
const SoftwareBody = z.object({
  translations: translationsSchema(SoftwareTranslationSchema.shape),
  moreInfo: z.string().optional(),
});

router.get("/:groupId/software", validate("param", GroupIdParam), async (c) => {
  const { groupId } = c.req.valid("param");
  return c.json(await toAdminSoftwareViews(await listSoftware(groupId)));
});

router.get("/software/:id", validate("param", IdParam), async (c) => {
  const row = await getSoftware(c.req.valid("param").id);
  if (!row) throw notFound();
  const [view] = await toAdminSoftwareViews([row]);
  return c.json(view);
});

router.post("/software", validate("json", SoftwareBody.extend({ groupId: z.number().int() })), async (c) => {
  const id = await createSoftware(c.req.valid("json"));
  return c.json({ id }, 201);
});

router.put("/software/:id", validate("param", IdParam), validate("json", SoftwareBody), async (c) => {
  await updateSoftware(c.req.valid("param").id, c.req.valid("json"));
  return c.json(okStatus());
});

router.delete("/software/:id", validate("param", IdParam), async (c) => {
  await deleteSoftware(c.req.valid("param").id);
  return c.json(okStatus());
});

router.get("/:groupId/equipment", validate("param", GroupIdParam), async (c) => {
  const { groupId } = c.req.valid("param");
  return c.json(await listEquipment(groupId));
});

router.get("/equipment/:id", validate("param", IdParam), async (c) => {
  const row = await getEquipment(c.req.valid("param").id);
  if (!row) throw notFound();
  return c.json(row);
});

router.post("/equipment", validate("json", EquipmentFieldsSchema.extend({ groupId: z.number().int() })), async (c) => {
  const id = await createEquipment(c.req.valid("json"));
  return c.json({ id }, 201);
});

router.put("/equipment/:id", validate("param", IdParam), validate("json", EquipmentFieldsSchema), async (c) => {
  await updateEquipment(c.req.valid("param").id, c.req.valid("json"));
  return c.json(okStatus());
});

router.delete("/equipment/:id", validate("param", IdParam), async (c) => {
  await deleteEquipment(c.req.valid("param").id);
  return c.json(okStatus());
});

export default router;
