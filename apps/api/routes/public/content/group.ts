import { Hono } from "hono";
import { z } from "zod";

import { notFound } from "../../../lib/errors/app-error.js";
import { validate } from "../../../lib/validate.js";
import { resolveAssetAccessUrls } from "../../../services/assets/service.js";
import {
  listAboutLocalized,
  listEquipment,
  listGroupsLocalized,
  listSoftwareLocalized,
  resolveGroupAssets,
} from "../../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", async (c) => {
  const locale = c.get("locale");
  const groups = await listGroupsLocalized(locale);
  const row = groups[0];
  if (!row) throw notFound();
  return c.json({
    id: row.id,
    summary: row.summary,
    address: row.address,
    email: row.email,
    phone: row.phone,
    name: row.name,
    fullName: row.fullName,
    assets: await resolveGroupAssets(row.id),
    facilities: row.facilities,
    futureWork: row.futureWork,
    publicationsSection: row.publicationsSection,
    projectsSection: row.projectsSection,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
});

router.get("/:id/about", validate("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const rows = await listAboutLocalized(id, locale);
  const assets = await resolveAssetAccessUrls({
    ownerType: "about",
    ownerIds: rows.map((row) => row.id),
    slot: "photo",
  });
  return c.json(
    rows.map((row) => ({
      id: row.id,
      description: row.description,
      objectivesContent: row.objectivesContent,
      servicesContent: row.servicesContent,
      homeServicesTeaserContent: row.homeServicesTeaserContent,
      asset: assets.get(row.id) ?? null,
      groupId: row.groupId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
  );
});

router.get(
  "/:groupId/software",
  validate("param", z.object({ groupId: z.coerce.number().int().positive() })),
  async (c) => {
    const locale = c.get("locale");
    const { groupId } = c.req.valid("param");
    const rows = await listSoftwareLocalized(locale, groupId);
    return c.json(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        moreInfo: row.moreInfo,
        groupId: row.groupId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
    );
  },
);

router.get(
  "/:groupId/equipment",
  validate("param", z.object({ groupId: z.coerce.number().int().positive() })),
  async (c) => {
    const { groupId } = c.req.valid("param");
    const rows = await listEquipment(groupId);
    return c.json(rows);
  },
);

export default router;
