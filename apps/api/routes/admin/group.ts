import { Hono } from "hono";
import { z } from "zod";

import type { LocalizedTranslations } from "../../lib/admin-translations.js";
import { translationsSchema } from "../../lib/admin-translations.js";
import { okStatus } from "../../lib/contracts.js";
import { AppError } from "../../lib/errors/app-error.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "../../middleware/authz.js";
import {
  createEquipment,
  createSoftware,
  deleteEquipment,
  deleteSoftware,
  listAbout,
  listEquipment,
  listGroups,
  listSoftware,
  updateAboutDescription,
  updateAboutHomeServicesTeaser,
  updateAboutObjectives,
  updateAboutServices,
  updateEquipment,
  updateGroupFacilities,
  updateGroupFutureWork,
  updateGroupInfo,
  updateGroupProjectsSection,
  updateGroupPublicationsSection,
  updateGroupSummary,
  updateSoftware,
} from "../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const AboutSectionSchema = z.object({
  introParagraphs: z.array(z.string().trim().min(1)),
  items: z.array(z.string().trim().min(1)),
});

/** Stored content that is absent or malformed is a data fault, not a client error. */
function parseJsonContentStrict<T>(raw: string | null, schema: z.ZodType<T>, field: string): T {
  const missing = () => new AppError("internal_error", "Missing translation", 500, { field });
  if (!raw) throw missing();
  try {
    return schema.parse(JSON.parse(raw));
  } catch {
    throw missing();
  }
}

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("content.read")(c, next);
  return requirePermission("content.write")(c, next);
});

router.get("/", async (c) => {
  const rows = await listGroups();
  return c.json(rows);
});

router.put(
  "/:id/info",
  validate("param", IdParam),
  validate("json", z.object({ email: z.string().optional(), phone: z.string().optional() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupInfo(id, data);
    return c.json(okStatus());
  },
);

router.put(
  "/:id/summary",
  validate("param", IdParam),
  validate("json", z.object({ translations: translationsSchema({ summary: z.string().min(1) }) })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupSummary(id, data);
    return c.json(okStatus());
  },
);

router.put(
  "/:id/facilities",
  validate("param", IdParam),
  validate("json", z.object({ translations: translationsSchema({ facilities: z.string().optional() }) })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupFacilities(id, data);
    return c.json(okStatus());
  },
);

router.put(
  "/:id/future-work",
  validate("param", IdParam),
  validate("json", z.object({ translations: translationsSchema({ futureWork: z.string().optional() }) })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupFutureWork(id, data);
    return c.json(okStatus());
  },
);

router.put(
  "/:id/publications-section",
  validate("param", IdParam),
  validate("json", z.object({ translations: translationsSchema({ publicationsSection: z.string().optional() }) })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupPublicationsSection(id, data);
    return c.json(okStatus());
  },
);

router.put(
  "/:id/projects-section",
  validate("param", IdParam),
  validate("json", z.object({ translations: translationsSchema({ projectsSection: z.string().optional() }) })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupProjectsSection(id, data);
    return c.json(okStatus());
  },
);

router.get("/:id/about", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await listAbout(id);
  return c.json(
    rows.map((row) =>
      Object.assign(row, {
        translations: Object.fromEntries(
          row.translations.map((tr) => [
            tr.locale,
            {
              description: tr.description,
              objectivesContent: parseJsonContentStrict(
                tr.objectivesContent,
                AboutSectionSchema,
                `about:${row.id}:${tr.locale}:objectivesContent`,
              ),
              servicesContent: parseJsonContentStrict(
                tr.servicesContent,
                AboutSectionSchema,
                `about:${row.id}:${tr.locale}:servicesContent`,
              ),
              homeServicesTeaserContent: parseJsonContentStrict(
                tr.homeServicesTeaserContent,
                z.object({ paragraphs: z.array(z.string().trim().min(1)) }),
                `about:${row.id}:${tr.locale}:homeServicesTeaserContent`,
              ),
            },
          ]),
        ),
      }),
    ),
  );
});

router.put(
  "/about/:id/description",
  validate("param", IdParam),
  validate("json", z.object({ translations: translationsSchema({ description: z.string().min(1) }) })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateAboutDescription(id, data);
    return c.json(okStatus());
  },
);

router.put(
  "/about/:id/objectives",
  validate("param", IdParam),
  validate("json", z.object({ translations: translationsSchema({ objectivesContent: AboutSectionSchema }) })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    const translations: LocalizedTranslations<{ objectivesContent?: string }> = {};
    for (const [locale, tr] of Object.entries(data.translations)) {
      translations[locale] = { objectivesContent: JSON.stringify(tr.objectivesContent) };
    }
    await updateAboutObjectives(id, {
      translations,
    });
    return c.json(okStatus());
  },
);

router.put(
  "/about/:id/services",
  validate("param", IdParam),
  validate("json", z.object({ translations: translationsSchema({ servicesContent: AboutSectionSchema }) })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    const translations: LocalizedTranslations<{ servicesContent?: string }> = {};
    for (const [locale, tr] of Object.entries(data.translations)) {
      translations[locale] = { servicesContent: JSON.stringify(tr.servicesContent) };
    }
    await updateAboutServices(id, {
      translations,
    });
    return c.json(okStatus());
  },
);

router.put(
  "/about/:id/home-services-teaser",
  validate("param", IdParam),
  validate(
    "json",
    z.object({
      translations: translationsSchema({
        homeServicesTeaserContent: z.object({ paragraphs: z.array(z.string().trim().min(1)).min(1) }),
      }),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    const translations: LocalizedTranslations<{ homeServicesTeaserContent?: string }> = {};
    for (const [locale, tr] of Object.entries(data.translations)) {
      translations[locale] = { homeServicesTeaserContent: JSON.stringify(tr.homeServicesTeaserContent) };
    }
    await updateAboutHomeServicesTeaser(id, {
      translations,
    });
    return c.json(okStatus());
  },
);

router.get(
  "/:groupId/software",
  validate("param", z.object({ groupId: z.coerce.number().int().positive() })),
  async (c) => {
    const { groupId } = c.req.valid("param");
    const rows = await listSoftware(groupId);
    return c.json(rows);
  },
);

router.post(
  "/software",
  validate(
    "json",
    z.object({
      translations: translationsSchema({
        name: z.string().min(1),
        description: z.string().optional(),
      }),
      moreInfo: z.string().optional(),
      groupId: z.number().int(),
    }),
  ),
  async (c) => {
    const data = c.req.valid("json");
    const id = await createSoftware(data);
    return c.json({ id }, 201);
  },
);

router.put(
  "/software/:id",
  validate("param", IdParam),
  validate(
    "json",
    z.object({
      translations: translationsSchema({
        name: z.string().min(1),
        description: z.string().optional(),
      }),
      moreInfo: z.string().optional(),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateSoftware(id, data);
    return c.json(okStatus());
  },
);

router.delete("/software/:id", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteSoftware(id);
  return c.json(okStatus());
});

router.get(
  "/:groupId/equipment",
  validate("param", z.object({ groupId: z.coerce.number().int().positive() })),
  async (c) => {
    const { groupId } = c.req.valid("param");
    const rows = await listEquipment(groupId);
    return c.json(rows);
  },
);

router.post(
  "/equipment",
  validate(
    "json",
    z.object({
      name: z.string().min(1),
      cpu: z.string().optional(),
      gpu: z.string().optional(),
      ram: z.string().optional(),
      storage: z.string().optional(),
      groupId: z.number().int(),
    }),
  ),
  async (c) => {
    const data = c.req.valid("json");
    const id = await createEquipment(data);
    return c.json({ id }, 201);
  },
);

router.put(
  "/equipment/:id",
  validate("param", IdParam),
  validate(
    "json",
    z.object({
      name: z.string().min(1),
      cpu: z.string().optional(),
      gpu: z.string().optional(),
      ram: z.string().optional(),
      storage: z.string().optional(),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateEquipment(id, data);
    return c.json(okStatus());
  },
);

router.delete("/equipment/:id", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteEquipment(id);
  return c.json(okStatus());
});

export default router;
