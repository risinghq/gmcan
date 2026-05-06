import { Hono } from "hono";

import { listSoftwareLocalized } from "../../../services/group.service.js";

const router = new Hono();

router.get("/", async (c) => {
  const locale = c.get("locale");
  const rows = await listSoftwareLocalized(locale);
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
});

export default router;
