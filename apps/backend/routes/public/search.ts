import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { globalSearch } from "../../services/search.service.js";

const router = new Hono();

const SearchQuery = z.object({
  q: z.string().default(""),
  types: z.string().default("publications,members,news,projects"),
});

router.get("/", zValidator("query", SearchQuery), async (c) => {
  const { q, types } = c.req.valid("query");
  const term = q.trim();

  if (term.length < 2) {
    return c.json({ publications: [], members: [], news: [], projects: [] });
  }

  const requested = new Set(types.split(",").map((t) => t.trim()));
  const result = await globalSearch(term, requested);
  return c.json(result);
});

export default router;
