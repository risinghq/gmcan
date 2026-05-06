import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { getProjectLocalized, listProjectsLocalized } from "../../../services/project.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const StatusCode = z.enum(["planned", "active", "completed", "archived"]);
const FilterQuery = z.object({ statusCode: StatusCode.optional() });

function toPublicProject(row: Awaited<ReturnType<typeof getProjectLocalized>>) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    code: row.code,
    fundedAmountMinor: row.fundedAmountMinor,
    description: row.description,
    statusCode: row.statusCode,
    startDate: row.startDate,
    endDate: row.endDate,
    researchLineId: row.researchLineId,
    currencyCode: row.currencyCode,
    fundingSourceCode: row.fundingSourceCode,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

router.get("/", zValidator("query", FilterQuery), async (c) => {
  const locale = c.get("locale");
  const { statusCode } = c.req.valid("query");
  const rows = await listProjectsLocalized(locale, statusCode);
  return c.json(rows.map((row) => toPublicProject(row)));
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const row = await getProjectLocalized(id, locale);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(toPublicProject(row));
});

export default router;
