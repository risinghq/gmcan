import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { localizeField } from "../../lib/public-locale.js";
import { resolveAssetAccessUrl } from "../../services/asset.service.js";
import { listAbout, listEquipment, listGroups, listSoftware } from "../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const AboutSectionSchema = z.object({
  introParagraphs: z.array(z.string()),
  items: z.array(z.string()),
});
const LocalizedSectionSchema = z.object({ es: AboutSectionSchema, en: AboutSectionSchema });
const HomeTeaserSchema = z.object({
  es: z.object({ paragraphs: z.array(z.string()) }),
  en: z.object({ paragraphs: z.array(z.string()) }),
});

function parseJsonContent<T>(raw: string | null, schema: z.ZodType<T>, fallback: T): T {
  if (!raw) return fallback;
  try {
    return schema.parse(JSON.parse(raw));
  } catch {
    return fallback;
  }
}

router.get("/", async (c) => {
  const locale = c.get("locale");
  const groups = await listGroups();
  const row = groups[0];
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({
    id: row.id,
    summary: localizeField(row, locale, { es: "summaryES", en: "summaryEN" }),
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
    facilities: localizeField(row, locale, { es: "facilitiesES", en: "facilitiesEN", required: false }),
    futureWork: localizeField(row, locale, { es: "futureWorkES", en: "futureWorkEN", required: false }),
    publicationsSection: localizeField(row, locale, {
      es: "publicationsSectionES",
      en: "publicationsSectionEN",
      required: false,
    }),
    projectsSection: localizeField(row, locale, { es: "projectsSectionES", en: "projectsSectionEN", required: false }),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
});

router.get("/:id/about", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const rows = await listAbout(id);
  const shaped = await Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      description: localizeField(row, locale, { es: "descriptionES", en: "descriptionEN" }),
      objectivesContent: parseJsonContent(row.objectivesContent, LocalizedSectionSchema, {
        es: { introParagraphs: [], items: [] },
        en: { introParagraphs: [], items: [] },
      })[locale],
      servicesContent: parseJsonContent(row.servicesContent, LocalizedSectionSchema, {
        es: { introParagraphs: [], items: [] },
        en: { introParagraphs: [], items: [] },
      })[locale],
      homeServicesTeaserContent: parseJsonContent(row.homeServicesTeaserContent, HomeTeaserSchema, {
        es: { paragraphs: [] },
        en: { paragraphs: [] },
      })[locale],
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
    const rows = await listSoftware(groupId);
    return c.json(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: localizeField(row, locale, { es: "description", en: "descriptionEN", required: false }),
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
