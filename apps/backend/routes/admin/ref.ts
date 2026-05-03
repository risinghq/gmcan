import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z, type ZodType } from "zod";

import { db } from "../../db/client.js";
import type { Database } from "../../db/schema.js";
import { requirePermission } from "../../middleware/authz.js";

function crudRouter<T extends keyof Database>(table: T, createSchema: ZodType, updateSchema: ZodType): Hono {
  const router = new Hono();
  const IdParam = z.object({ id: z.coerce.number().int().positive() });

  router.get("/", async (c) => {
    const rows = await db.selectFrom(table).selectAll().execute();
    return c.json(rows);
  });

  router.get("/:id", zValidator("param", IdParam), async (c) => {
    const { id } = c.req.valid("param");
    const row = await (db as any).selectFrom(table).selectAll().where("id", "=", id).executeTakeFirst();
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json(row);
  });

  router.post("/", zValidator("json", createSchema), async (c) => {
    const data = c.req.valid("json");
    const result = await (db as any).insertInto(table).values(data).executeTakeFirst();
    return c.json({ id: Number(result.insertId) }, 201);
  });

  router.put("/:id", zValidator("param", IdParam), zValidator("json", updateSchema), async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await (db as any).updateTable(table).set(data).where("id", "=", id).execute();
    return c.json({ status: 1 });
  });

  router.delete("/:id", zValidator("param", IdParam), async (c) => {
    const { id } = c.req.valid("param");
    await (db as any).deleteFrom(table).where("id", "=", id).execute();
    return c.json({ status: 1 });
  });

  return router;
}

const router = new Hono();
router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("refs.read")(c, next);
  return requirePermission("refs.write")(c, next);
});

router.route(
  "/gender",
  crudRouter("gender", z.object({ name: z.string().min(1) }), z.object({ name: z.string().min(1) })),
);

router.route(
  "/prefix",
  crudRouter("prefix", z.object({ name: z.string().min(1) }), z.object({ name: z.string().min(1) })),
);

router.route("/role", crudRouter("role", z.object({ name: z.string().min(1) }), z.object({ name: z.string().min(1) })));

router.route(
  "/member-type",
  crudRouter(
    "member_type",
    z.object({
      name: z.string().min(1),
      nameEN: z.string().min(1),
      nameSingular: z.string().min(1),
      nameSingularEN: z.string().min(1),
    }),
    z.object({
      name: z.string().min(1),
      nameEN: z.string().min(1),
      nameSingular: z.string().min(1),
      nameSingularEN: z.string().min(1),
    }),
  ),
);

router.route(
  "/publication-type",
  crudRouter(
    "publication_type",
    z.object({ name: z.string().min(1), nameEN: z.string().min(1) }),
    z.object({ name: z.string().min(1), nameEN: z.string().min(1) }),
  ),
);

router.route(
  "/thesis-type",
  crudRouter(
    "thesis_type",
    z.object({ name: z.string().min(1), nameEN: z.string().min(1) }),
    z.object({ name: z.string().min(1), nameEN: z.string().min(1) }),
  ),
);

router.route(
  "/news-type",
  crudRouter(
    "news_type",
    z.object({ name: z.string().min(1), nameEN: z.string().min(1) }),
    z.object({ name: z.string().min(1), nameEN: z.string().min(1) }),
  ),
);

router.route(
  "/journal",
  crudRouter("journal", z.object({ name: z.string().min(1) }), z.object({ name: z.string().min(1) })),
);

router.route(
  "/university",
  crudRouter(
    "university",
    z.object({ name: z.string().min(1), nameEN: z.string().min(1) }),
    z.object({ name: z.string().min(1), nameEN: z.string().min(1) }),
  ),
);

router.route(
  "/funding-source",
  crudRouter("funding_source", z.object({ name: z.string().min(1) }), z.object({ name: z.string().min(1) })),
);

router.route(
  "/currency",
  crudRouter("currency", z.object({ symbol: z.string().min(1) }), z.object({ symbol: z.string().min(1) })),
);

export default router;
