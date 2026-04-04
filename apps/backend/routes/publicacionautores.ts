import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { sql } from "kysely";
import { z } from "zod";

import { checkSession } from "../auth/session.js";
import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const DniParam = z.object({ dni: z.string().min(1) });
const SearchQuery = z.object({ q: z.string().default("") });

const SaveEntry = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("registered"), DNI: z.string().min(1), isPrincipal: z.number().int() }),
  z.object({ kind: z.literal("external"), nombre: z.string().min(1), isPrincipal: z.number().int() }),
]);
const SaveBody = z.array(SaveEntry);

// GET /publicacion-autores/search?q=
// autocomplete pool
router.get("/search", zValidator("query", SearchQuery), async (c) => {
  const { q } = c.req.valid("query");
  const like = `%${q}%`;

  const [users, externals] = await Promise.all([
    db
      .selectFrom("usuario")
      .select(["DNI", "nombre", "apellidoPaterno", "apellidoMaterno", "foto"])
      .where((eb) =>
        eb.or([eb("nombre", "like", like), eb("apellidoPaterno", "like", like), eb("apellidoMaterno", "like", like)]),
      )
      .orderBy("nombre", "asc")
      .execute(),
    db
      .selectFrom("publicacion_has_autor")
      .select("nombre")
      .where("usuario_DNI", "is", null)
      .where("nombre", "like", like)
      .distinct()
      .orderBy("nombre", "asc")
      .execute(),
  ]);

  const result = [
    ...users.map((u) => ({
      kind: "registered" as const,
      DNI: u.DNI,
      nombre: `${u.nombre} ${u.apellidoPaterno}${u.apellidoMaterno ? " " + u.apellidoMaterno : ""}`.trim(),
      foto: u.foto ?? null,
    })),
    ...externals.filter((e) => e.nombre != null).map((e) => ({ kind: "external" as const, nombre: e.nombre! })),
  ];

  return c.json(result);
});

// GET /publicacion-autores/by-user/:dni
// publication IDs credited to a user
router.get("/by-user/:dni", zValidator("param", DniParam), async (c) => {
  const { dni } = c.req.valid("param");
  const rows = await db
    .selectFrom("publicacion_has_autor")
    .select("publicacion_idPublicacion")
    .where("usuario_DNI", "=", dni)
    .execute();
  return c.json(rows);
});

// GET /publicacion-autores/search-publications?q=
// publication IDs credited to matching authors
router.get("/search-publications", zValidator("query", SearchQuery), async (c) => {
  const { q } = c.req.valid("query");
  const like = `%${q}%`;

  const rows = await db
    .selectFrom("publicacion_has_autor")
    .leftJoin("usuario", "usuario.DNI", "publicacion_has_autor.usuario_DNI")
    .select("publicacion_has_autor.publicacion_idPublicacion")
    .where((eb) =>
      eb.or([
        eb("publicacion_has_autor.nombre", "like", like),
        eb("usuario.nombre", "like", like),
        eb("usuario.apellidoPaterno", "like", like),
      ]),
    )
    .distinct()
    .execute();

  return c.json(rows);
});

// GET /publicacion-autores/:id
// all authors for a publication
router.get("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");

  const rows = await db
    .selectFrom("publicacion_has_autor")
    .leftJoin("usuario", "usuario.DNI", "publicacion_has_autor.usuario_DNI")
    .select([
      "publicacion_has_autor.isPrincipal",
      "publicacion_has_autor.nombre",
      "publicacion_has_autor.usuario_DNI",
      sql<string>`usuario.nombre`.as("userNombre"),
      sql<string>`usuario.apellidoPaterno`.as("userApellidoPaterno"),
      sql<string | null>`usuario.apellidoMaterno`.as("userApellidoMaterno"),
      sql<string | null>`usuario.foto`.as("userFoto"),
    ])
    .where("publicacion_has_autor.publicacion_idPublicacion", "=", id)
    .orderBy("publicacion_has_autor.isPrincipal", "asc")
    .execute();

  const result = rows.map((row) => {
    if (row.usuario_DNI) {
      return {
        kind: "registered" as const,
        DNI: row.usuario_DNI,
        nombre:
          `${row.userNombre ?? ""} ${row.userApellidoPaterno ?? ""}${row.userApellidoMaterno ? " " + row.userApellidoMaterno : ""}`.trim(),
        foto: row.userFoto ?? null,
        isPrincipal: row.isPrincipal,
      };
    }
    return {
      kind: "external" as const,
      nombre: row.nombre ?? "",
      isPrincipal: row.isPrincipal,
    };
  });

  return c.json(result);
});

// PUT /publicacion-autores/:id
// replace all authors for a publication (atomic)
router.put("/:id", checkSession, zValidator("param", IdParam), zValidator("json", SaveBody), async (c) => {
  const { id } = c.req.valid("param");
  const authors = c.req.valid("json");

  await db.deleteFrom("publicacion_has_autor").where("publicacion_idPublicacion", "=", id).execute();

  if (authors.length > 0) {
    await db
      .insertInto("publicacion_has_autor")
      .values(
        authors.map((a) => ({
          publicacion_idPublicacion: id,
          isPrincipal: a.isPrincipal,
          nombre: a.kind === "external" ? a.nombre : null,
          usuario_DNI: a.kind === "registered" ? a.DNI : null,
        })),
      )
      .execute();
  }

  return c.json({ status: 1 });
});

export default router;
