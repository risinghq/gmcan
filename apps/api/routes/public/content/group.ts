import { Hono } from "hono";
import { z } from "zod";

import { notFound } from "../../../lib/errors/app-error.js";
import { validate } from "../../../lib/validate.js";
import { resolveAssetAccessUrl, resolveAssetAccessUrls } from "../../../services/assets/service.js";
import {
  listAboutLocalized,
  listEquipment,
  listGroupsLocalized,
  listSoftwareLocalized,
} from "../../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const AboutSectionSchema = z.object({
  introParagraphs: z.array(z.string()),
  items: z.array(z.string()),
});
const HomeTeaserSchema = z.object({ paragraphs: z.array(z.string()) });

router.get("/", async (c) => {
  const locale = c.get("locale");
  const groups = await listGroupsLocalized(locale);
  const row = groups[0];
  if (!row) throw notFound();
  const [facilities, header, footer] = await Promise.all(
    (["facilities", "header", "footer"] as const).map((slot) =>
      resolveAssetAccessUrl({ ownerType: "research_group", ownerId: row.id, slot }),
    ),
  );
  return c.json({
    id: row.id,
    summary: row.summary,
    address: row.address,
    email: row.email,
    phone: row.phone,
    name: row.name,
    fullName: row.fullName,
    assets: { facilities, header, footer },
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
      objectivesContent: AboutSectionSchema.parse(JSON.parse(row.objectivesContent)),
      servicesContent: AboutSectionSchema.parse(JSON.parse(row.servicesContent)),
      homeServicesTeaserContent: HomeTeaserSchema.parse(JSON.parse(row.homeServicesTeaserContent)),
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
