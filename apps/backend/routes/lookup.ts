import { Hono } from "hono";

import { db } from "../db/client.js";

const router = new Hono();

router.get("/", async (c) => {
  const [
    generos,
    prefijos,
    tiposMiembro,
    tiposPublicacion,
    tiposTesis,
    monedas,
    tiposNoticia,
    tiposUsuario,
    fuentesFinanciamiento,
    universidades,
    revistas,
    eventos,
  ] = await Promise.all([
    db.selectFrom("genero").select(["idGenero", "nombre"]).execute(),
    db.selectFrom("prefijo").select(["idPrefijo", "nombre"]).execute(),
    db
      .selectFrom("tipomiembro")
      .select(["idTipoMiembro", "nombre", "nombreEN", "nombreSingular", "nombreSingularEN"])
      .execute(),
    db.selectFrom("tipopublicacion").select(["idTipoPublicacion", "nombre", "nombreEN"]).execute(),
    db.selectFrom("tipotesis").select(["idTipoTesis", "nombre", "nombreEN"]).execute(),
    db.selectFrom("moneda").select(["idMoneda", "simbolo"]).execute(),
    db.selectFrom("tiponoticia").select(["idtipoNoticia", "nombre", "nombreEN"]).execute(),
    db.selectFrom("tipousuario").select(["idTipoUsuario", "nombre"]).execute(),
    db.selectFrom("fuentefinanciamiento").select(["idFuenteFinanciamiento", "nombre"]).execute(),
    db.selectFrom("universidad").select(["idUniversidad", "nombre", "nombreEN"]).execute(),
    db.selectFrom("revista").select(["idRevista", "nombre"]).execute(),
    db.selectFrom("evento").select(["idEvento", "nombre", "ciudad", "pais"]).execute(),
  ]);

  return c.json({
    generos,
    prefijos,
    tiposMiembro,
    tiposPublicacion,
    tiposTesis,
    monedas,
    tiposNoticia,
    tiposUsuario,
    fuentesFinanciamiento,
    universidades,
    revistas,
    eventos,
  });
});

export default router;
