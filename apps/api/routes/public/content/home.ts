import { Hono } from "hono";

import { getHome } from "../../../services/home.service.js";

const router = new Hono();

router.get("/", async (c) => c.json(await getHome(c.get("locale"))));

export default router;
