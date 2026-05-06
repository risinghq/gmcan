import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { getProjectLocalized, listProjectsLocalized } from "../../services/project.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const FilterQuery = z.object({ status: z.coerce.number().int().optional() });

function toPublicProject(row: Awaited<ReturnType<typeof getProjectLocalized>>) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    code: row.code,
    fundedAmount: row.fundedAmount,
    description: row.description,
    status: row.status,
    startDate: row.startDate,
    endDate: row.endDate,
    researchLineId: row.researchLineId,
    currencyId: row.currencyId,
    fundingSourceId: row.fundingSourceId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

router.get("/", zValidator("query", FilterQuery), async (c) => {
  const locale = c.get("locale");
  const { status } = c.req.valid("query");
  const rows = await listProjectsLocalized(locale, status);
  return c.json(
    rows.map((row) => ({
      id: row.id,
      title: row.title,
      code: row.code,
      fundedAmount: row.fundedAmount,
      description: row.description,
      status: row.status,
      startDate: row.startDate,
      endDate: row.endDate,
      researchLineId: row.researchLineId,
      currencyId: row.currencyId,
      fundingSourceId: row.fundingSourceId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
  );
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const row = await getProjectLocalized(id, locale);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(toPublicProject(row));
});

export default router;
