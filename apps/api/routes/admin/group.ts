import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

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
const LocalizedSectionSchema = z.object({
  es: AboutSectionSchema,
  en: AboutSectionSchema,
});
const LocalizedTeaserSchema = z.object({
  es: z.object({ paragraphs: z.array(z.string().trim().min(1)).min(1) }),
  en: z.object({ paragraphs: z.array(z.string().trim().min(1)).min(1) }),
});

function parseJsonContent<T>(raw: string | null, schema: z.ZodType<T>, fallback: T): T {
  if (!raw) return fallback;
  try {
    return schema.parse(JSON.parse(raw));
  } catch {
    return fallback;
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
  zValidator("json", z.object({ summaryES: z.string(), summaryEN: z.string() })),
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
  zValidator("json", z.object({ facilitiesES: z.string().optional(), facilitiesEN: z.string().optional() })),
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
  zValidator("json", z.object({ futureWorkES: z.string().optional(), futureWorkEN: z.string().optional() })),
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
  zValidator(
    "json",
    z.object({ publicationsSectionES: z.string().optional(), publicationsSectionEN: z.string().optional() }),
  ),
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
  zValidator("json", z.object({ projectsSectionES: z.string().optional(), projectsSectionEN: z.string().optional() })),
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
        objectivesContent: parseJsonContent(
          row.objectivesContent,
          LocalizedSectionSchema,
          { es: { introParagraphs: [], items: [] }, en: { introParagraphs: [], items: [] } },
        ),
        servicesContent: parseJsonContent(
          row.servicesContent,
          LocalizedSectionSchema,
          { es: { introParagraphs: [], items: [] }, en: { introParagraphs: [], items: [] } },
        ),
        homeServicesTeaserContent: parseJsonContent(
          row.homeServicesTeaserContent,
          LocalizedTeaserSchema,
          { es: { paragraphs: [] }, en: { paragraphs: [] } },
        ),
      }),
    ),
  );
});

router.put(
  "/about/:id/description",
  zValidator("param", IdParam),
  zValidator("json", z.object({ descriptionES: z.string(), descriptionEN: z.string() })),
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
  zValidator("json", z.object({ objectivesContent: LocalizedSectionSchema })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateAboutObjectives(id, { objectivesContent: JSON.stringify(data.objectivesContent) });
    return c.json(okStatus());
  },
);

router.put(
  "/about/:id/services",
  zValidator("param", IdParam),
  zValidator("json", z.object({ servicesContent: LocalizedSectionSchema })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateAboutServices(id, { servicesContent: JSON.stringify(data.servicesContent) });
    return c.json(okStatus());
  },
);

router.put(
  "/about/:id/home-services-teaser",
  zValidator("param", IdParam),
  zValidator("json", z.object({ homeServicesTeaserContent: LocalizedTeaserSchema })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateAboutHomeServicesTeaser(id, {
      homeServicesTeaserContent: JSON.stringify(data.homeServicesTeaserContent),
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
      name: z.string().optional(),
      description: z.string().optional(),
      descriptionEN: z.string().optional(),
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
      name: z.string().optional(),
      description: z.string().optional(),
      descriptionEN: z.string().optional(),
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
