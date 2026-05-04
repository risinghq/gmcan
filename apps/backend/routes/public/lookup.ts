import { Hono } from "hono";

import { localizeField } from "../../lib/public-locale.js";
import { getLookupData } from "../../services/ref.service.js";

const router = new Hono();

router.get("/", async (c) => {
  const locale = c.get("locale");
  const data = await getLookupData();
  return c.json({
    memberTypes: data.memberTypes.map((item) => ({
      id: item.id,
      name: localizeField(item, locale, { es: "name", en: "nameEN" }),
      nameSingular: localizeField(item, locale, { es: "nameSingular", en: "nameSingularEN" }),
    })),
    publicationTypes: data.publicationTypes.map((item) => ({
      id: item.id,
      name: localizeField(item, locale, { es: "name", en: "nameEN" }),
    })),
    thesisTypes: data.thesisTypes.map((item) => ({
      id: item.id,
      name: localizeField(item, locale, { es: "name", en: "nameEN" }),
    })),
    newsTypes: data.newsTypes.map((item) => ({
      id: item.id,
      name: localizeField(item, locale, { es: "name", en: "nameEN" }),
    })),
    fundingSources: data.fundingSources,
    universities: data.universities.map((item) => ({
      id: item.id,
      name: localizeField(item, locale, { es: "name", en: "nameEN" }),
    })),
    journals: data.journals,
    events: data.events.map((item) => ({
      id: item.id,
      name: localizeField(item, locale, { es: "name", en: "name" }),
      city: localizeField(item, locale, { es: "city", en: "cityEN", required: false }),
      country: localizeField(item, locale, { es: "country", en: "countryEN", required: false }),
    })),
  });
});

export default router;
