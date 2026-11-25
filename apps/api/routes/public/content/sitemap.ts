import { Hono } from "hono";

import { listSitemapEntries } from "../../../services/sitemap.service.js";

const router = new Hono();

router.get("/", async (c) => c.json(await listSitemapEntries()));

export default router;
