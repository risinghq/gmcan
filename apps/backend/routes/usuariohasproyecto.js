const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const router = new Hono();

router.get("/get-usuariohasproyecto", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from usuario_has_proyecto", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-usuariohasproyecto/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * FROM usuario_has_proyecto WHERE proyecto_idProyecto = ?",
      [c.req.param("id")],
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

router.get("/get-usuariohasproyectos/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * FROM usuario_has_proyecto WHERE usuario_DNI = ?;",
      [c.req.param("id")],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json(rows));
        } else {
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.post("/post-usuariohasproyecto", checkToken, async (c) => {
  let usuariohasproyecto = await c.req.json();
  var sql = "INSERT INTO usuario_has_proyecto (proyecto_idProyecto, usuario_DNI) VALUES(?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [usuariohasproyecto.proyecto_idProyecto, usuariohasproyecto.usuario_DNI],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "El usuariohasproyecto ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-usuariohasproyecto/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "DELETE FROM usuario_has_proyecto WHERE proyecto_idProyecto = ?",
      [c.req.param("id")],
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
