import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { throwMissingTranslation } from "../../lib/public-locale.js";
import { resolveAssetAccessUrl } from "../../services/asset.service.js";
import {
  listAboutLocalized,
  listEquipment,
  listGroupsLocalized,
  listSoftwareLocalized,
} from "../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const AboutSectionSchema = z.object({
  introParagraphs: z.array(z.string()),
  items: z.array(z.string()),
});
const HomeTeaserSchema = z.object({ paragraphs: z.array(z.string()) });

function parseJsonContentStrict<T>(raw: string | null, schema: z.ZodType<T>, field: string): T {
  if (!raw) throwMissingTranslation(field);
  try {
    return schema.parse(JSON.parse(raw));
  } catch {
    throwMissingTranslation(field);
  }
}

router.get("/", async (c) => {
  const locale = c.get("locale");
  const groups = await listGroupsLocalized(locale);
  const row = groups[0];
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({
    id: row.id,
    summary: row.summary,
    address: row.address,
    email: row.email,
    phone: row.phone,
    name: row.name,
    fullName: row.fullName,
    assets: {
      facilities: await resolveAssetAccessUrl({
        resourceType: "research_group",
        resourceId: row.id,
        slot: "facilities",
      }),
      header: await resolveAssetAccessUrl({ resourceType: "research_group", resourceId: row.id, slot: "header" }),
      footer: await resolveAssetAccessUrl({ resourceType: "research_group", resourceId: row.id, slot: "footer" }),
    },
    facilities: row.facilities,
    futureWork: row.futureWork,
    publicationsSection: row.publicationsSection,
    projectsSection: row.projectsSection,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
});

router.get("/:id/about", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const rows = await listAboutLocalized(id, locale);
  const shaped = await Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      description: row.description,
      objectivesContent: parseJsonContentStrict(
        row.objectivesContent,
        AboutSectionSchema,
        `about:${row.id}:objectivesContent`,
      ),
      servicesContent: parseJsonContentStrict(
        row.servicesContent,
        AboutSectionSchema,
        `about:${row.id}:servicesContent`,
      ),
      homeServicesTeaserContent: parseJsonContentStrict(
        row.homeServicesTeaserContent,
        HomeTeaserSchema,
        `about:${row.id}:homeServicesTeaserContent`,
      ),
      asset: await resolveAssetAccessUrl({ resourceType: "about", resourceId: row.id, slot: "photo" }),
      groupId: row.groupId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
  );
  return c.json(shaped);
});

router.get(
  "/:groupId/software",
  zValidator("param", z.object({ groupId: z.coerce.number().int().positive() })),
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
  zValidator("param", z.object({ groupId: z.coerce.number().int().positive() })),
  async (c) => {
    const { groupId } = c.req.valid("param");
    const rows = await listEquipment(groupId);
    return c.json(rows);
  },
);

export default router;
