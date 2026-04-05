import { zValidator } from "@hono/zod-validator";
import type { Hono } from "hono";

import { checkSession } from "../../auth/session.js";
import { publicacionWithAuthors } from "../../db/views.js";
import { IdParam } from "./schema.js";

export function registerPublicacionEditViewRoutes(router: Hono): void {
  router.get("/:id/edit-view", checkSession, zValidator("param", IdParam), async (c) => {
    const { id } = c.req.valid("param");
    const result = await publicacionWithAuthors(id);
    if (!result.publicacion) return c.json({ error: "Not found" }, 404);
    return c.json(result);
  });
}
