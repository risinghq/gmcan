import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { assetUrl } from "../../lib/upload.js";
import { localizeField } from "../../lib/public-locale.js";
import { listAbout, listGroups } from "../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

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
    facilitiesPhoto: row.facilitiesPhoto,
    facilitiesPhotoUrl: assetUrl(row.facilitiesPhoto),
    facilities: localizeField(row, locale, { es: "facilitiesES", en: "facilitiesEN", required: false }),
    futureWork: localizeField(row, locale, { es: "futureWorkES", en: "futureWorkEN", required: false }),
    logoFooter: row.logoFooter,
    logoFooterUrl: assetUrl(row.logoFooter),
    logoHeader: row.logoHeader,
    logoHeaderUrl: assetUrl(row.logoHeader),
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
  return c.json(
    rows.map((row) => ({
      id: row.id,
      description: localizeField(row, locale, { es: "descriptionES", en: "descriptionEN" }),
      objectives: localizeField(row, locale, { es: "objectivesES", en: "objectivesEN", required: false }),
      services: localizeField(row, locale, { es: "servicesES", en: "servicesEN", required: false }),
      photo: row.photo,
      photoUrl: assetUrl(row.photo),
      groupId: row.groupId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
  );
});

export default router;
