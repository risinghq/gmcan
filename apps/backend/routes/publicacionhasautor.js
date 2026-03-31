const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const router = new Hono();

router.get("/get-publicacionhasautor", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from publicacion_has_autor", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-publicacionhasautor/:id", (c) => {
  let publicacion_has_autor = c.req.param("id");
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * from publicacion_has_autor WHERE publicacion_idPublicacion=" + publicacion_has_autor,
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

router.post("/search-publicacionhasautor", async (c) => {
  let publicacionhasautor = await c.req.json();
  var sql = "SELECT * from publicacion_has_autor WHERE autores_idAutor=?";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [publicacionhasautor.autores_idAutor], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-publicacionhasautor", checkToken, async (c) => {
  let publicacionhasautor = await c.req.json();
  var sql =
    "INSERT INTO publicacion_has_autor (autores_idAutor, publicacion_idPublicacion, isPrincipal) VALUES(?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        publicacionhasautor.autor_idAutor,
        publicacionhasautor.publicacion_idPublicacion,
        publicacionhasautor.isPrincipal,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El publicacion_has_autor ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ status: 1, message: "La publicacion no existe" }));
        }
      },
    );
  });
});

router.delete("/delete-publicacionhasautor/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "DELETE FROM publicacion_has_autor WHERE publicacion_idPublicacion=?",
      [c.req.param("id")],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "Borrado exitosamente" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
