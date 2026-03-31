const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const router = new Hono();

router.get("/get-publicacionhasusuario", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from publicacion_has_usuario", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-publicacionhasusuario/:id", (c) => {
  let publicacion_has_usuario = c.req.param("id");
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * from publicacion_has_usuario WHERE publicacion_idPublicacion=" + publicacion_has_usuario,
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json(rows));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.post("/search-publicacionhasusuario", async (c) => {
  let publicacionhasusuario = await c.req.json();
  var sql = "SELECT * from publicacion_has_usuario WHERE usuario_DNI=?";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [publicacionhasusuario.usuario_DNI], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-publicacionhasusuario", checkToken, async (c) => {
  let publicacionhasusuario = await c.req.json();
  var sql = "INSERT INTO publicacion_has_usuario (usuario_DNI, publicacion_idPublicacion, isPrincipal) VALUES(?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        publicacionhasusuario.usuario_DNI,
        publicacionhasusuario.publicacion_idPublicacion,
        publicacionhasusuario.isPrincipal,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El publicacion_has_usuario ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-publicacionhasusuario/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "DELETE FROM publicacion_has_usuario WHERE publicacion_idPublicacion=?",
      [c.req.param("id")],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "Borrado exitosamente" }));
        } else {
          console.log(err);
          resolve(c.json({ status: 1, message: "La publicacion no existe" }));
        }
      },
    );
  });
});

router.put("/update-publicacionhasusuario", checkToken, async (c) => {
  let publicacionhasusuario = await c.req.json();
  var sql =
    "UPDATE publicacion_has_usuario SET usuario_DNI=?, publicacion_idPublicacion=?, fechaCreacion=?,fechaActualizacion=?, isPrincipal=? WHERE  usuario_DNI=? AND publicacion_idPublicacion=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        publicacionhasusuario.usuario_DNI,
        publicacionhasusuario.publicacion_idPublicacion,
        publicacionhasusuario.fechaCreacion,
        publicacionhasusuario.fechaActualizacion,
        publicacionhasusuario.isPrincipal,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "El publicacion_has_usuario ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
