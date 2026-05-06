import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import type { LocalizedTranslations } from "../../lib/admin-translations.js";
import { translationsSchema } from "../../lib/admin-translations.js";
import { okStatus } from "../../lib/contracts.js";
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

function parseJsonContentStrict<T>(raw: string | null, schema: z.ZodType<T>, field: string): T {
  if (!raw) {
    throw new HTTPException(500, {
      res: new Response(JSON.stringify({ error: "Missing translation", code: "MISSING_TRANSLATION", field }), {
        status: 500,
        headers: { "content-type": "application/json" },
      }),
    });
  }
  try {
    return schema.parse(JSON.parse(raw));
  } catch {
    throw new HTTPException(500, {
      res: new Response(JSON.stringify({ error: "Missing translation", code: "MISSING_TRANSLATION", field }), {
        status: 500,
        headers: { "content-type": "application/json" },
      }),
    });
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
  zValidator("param", IdParam),
  zValidator("json", z.object({ email: z.string().optional(), phone: z.string().optional() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupInfo(id, data);
    return c.json(okStatus());
  },
);

router.put(
  "/:id/summary",
  zValidator("param", IdParam),
  zValidator("json", z.object({ translations: translationsSchema({ summary: z.string().min(1) }) })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupSummary(id, data);
    return c.json(okStatus());
  },
);

router.put(
  "/:id/facilities",
  zValidator("param", IdParam),
  zValidator("json", z.object({ translations: translationsSchema({ facilities: z.string().optional() }) })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupFacilities(id, data);
    return c.json(okStatus());
  },
);

router.put(
  "/:id/future-work",
  zValidator("param", IdParam),
  zValidator("json", z.object({ translations: translationsSchema({ futureWork: z.string().optional() }) })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupFutureWork(id, data);
    return c.json(okStatus());
  },
);

router.put(
  "/:id/publications-section",
  zValidator("param", IdParam),
  zValidator("json", z.object({ translations: translationsSchema({ publicationsSection: z.string().optional() }) })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupPublicationsSection(id, data);
    return c.json(okStatus());
  },
);

router.put(
  "/:id/projects-section",
  zValidator("param", IdParam),
  zValidator("json", z.object({ translations: translationsSchema({ projectsSection: z.string().optional() }) })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupProjectsSection(id, data);
    return c.json(okStatus());
  },
);

// About
router.get("/:id/about", zValidator("param", IdParam), async (c) => {
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
  zValidator("param", IdParam),
  zValidator("json", z.object({ translations: translationsSchema({ description: z.string().min(1) }) })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateAboutDescription(id, data);
    return c.json(okStatus());
  },
);

router.put(
  "/about/:id/objectives",
  zValidator("param", IdParam),
  zValidator("json", z.object({ translations: translationsSchema({ objectivesContent: AboutSectionSchema }) })),
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
  zValidator("param", IdParam),
  zValidator("json", z.object({ translations: translationsSchema({ servicesContent: AboutSectionSchema }) })),
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
  zValidator("param", IdParam),
  zValidator(
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

// Software
router.get(
  "/:groupId/software",
  zValidator("param", z.object({ groupId: z.coerce.number().int().positive() })),
  async (c) => {
    const { groupId } = c.req.valid("param");
    const rows = await listSoftware(groupId);
    return c.json(rows);
  },
);

router.post(
  "/software",
  zValidator(
    "json",
    z.object({
      translations: translationsSchema({
        name: z.string().optional(),
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
  zValidator("param", IdParam),
  zValidator(
    "json",
    z.object({
      translations: translationsSchema({
        name: z.string().optional(),
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

router.delete("/software/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteSoftware(id);
  return c.json(okStatus());
});

// Equipment
router.get(
  "/:groupId/equipment",
  zValidator("param", z.object({ groupId: z.coerce.number().int().positive() })),
  async (c) => {
    const { groupId } = c.req.valid("param");
    const rows = await listEquipment(groupId);
    return c.json(rows);
  },
);

router.post(
  "/equipment",
  zValidator(
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
  zValidator("param", IdParam),
  zValidator(
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

router.delete("/equipment/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteEquipment(id);
  return c.json(okStatus());
});

export default router;
