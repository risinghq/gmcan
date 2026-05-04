import { Hono } from "hono";

import { localizeField } from "../../lib/public-locale.js";
import { listSoftware } from "../../services/group.service.js";

const router = new Hono();

router.get("/", async (c) => {
  const locale = c.get("locale");
  const rows = await listSoftware();
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
});

export default router;
