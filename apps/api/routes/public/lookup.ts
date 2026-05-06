import { Hono } from "hono";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../../lib/locales.js";
import { getLookupData } from "../../services/ref.service.js";

const router = new Hono();

router.get("/", async (c) => {
  const locale = c.get("locale");
  const data = await getLookupData(locale);
  return c.json({
    memberTypes: data.memberTypes.map((item) => ({
      id: item.id,
      name: item.name,
      nameSingular: item.nameSingular,
    })),
    publicationTypes: data.publicationTypes.map((item) => ({
      id: item.id,
      name: item.name,
    })),
    thesisTypes: data.thesisTypes.map((item) => ({
      id: item.id,
      name: item.name,
    })),
    newsTypes: data.newsTypes.map((item) => ({
      id: item.id,
      name: item.name,
    })),
    fundingSources: data.fundingSources,
    universities: data.universities.map((item) => ({
      id: item.id,
      name: item.name,
    })),
    journals: data.journals,
    events: data.events.map((item) => ({
      id: item.id,
      name: item.name,
      city: item.city,
      country: item.country,
    })),
    locales: {
      supported: SUPPORTED_LOCALES,
      default: DEFAULT_LOCALE,
    },
  });
});

export default router;
