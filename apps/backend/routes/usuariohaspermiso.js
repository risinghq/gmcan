const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const router = new Hono();

router.get("/get-usuariohaspermiso", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from usuarioHasPermiso", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-usuariohaspermiso/:id", checkToken, (c) => {
  let usuarioHasPermiso = c.req.param("id");
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * from usuarioHasPermiso WHERE usuario_DNI=" + usuarioHasPermiso,
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

router.post("/post-usuariohaspermiso", checkToken, async (c) => {
  let usuarioHasPermiso = await c.req.json();
  var sql = "INSERT INTO usuarioHasPermiso (usuario_DNI, permiso_idPermiso) VALUES(?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [usuarioHasPermiso.usuario_DNI, usuarioHasPermiso.permiso_idPermiso],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El usuarioHasPermiso ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-usuariohaspermiso/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "DELETE FROM usuarioHasPermiso WHERE usuario_DNI=?",
      [c.req.param("id")],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1 }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
