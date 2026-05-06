import { Hono } from "hono";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../../../lib/locales.js";
import { getLookupData } from "../../../services/ref.service.js";

const router = new Hono();

router.get("/", async (c) => {
  const locale = c.get("locale");
  const data = await getLookupData(locale);
  return c.json({
    memberTypes: data.memberTypes,
    publicationKinds: data.publicationKinds,
    thesisKinds: data.thesisKinds,
    newsKinds: data.newsKinds,
    fundingSources: data.fundingSources,
    currencies: data.currencies,
    roles: data.roles,
    genders: data.genders,
    prefixes: data.prefixes,
    universities: data.universities,
    journals: data.journals,
    events: data.events,
    locales: {
      supported: SUPPORTED_LOCALES,
      default: DEFAULT_LOCALE,
    },
  });
});

export default router;
