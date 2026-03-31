const { Hono } = require("hono");
const mysqlConnection = require("../connection");

const router = new Hono();

router.get("/get-usuariohasgrupo", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from usuario_has_grupo", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-usuariohasgrupo", async (c) => {
  let usuariohasgrupo = await c.req.json();
  var sql =
    "INSERT INTO usuario_has_grupo (usuario_DNI, grupo_idGrupo, fechaCreacion, fechaActualizacion) VALUES(?,?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        usuariohasgrupo.usuario_DNI,
        usuariohasgrupo.grupo_idGrupo,
        usuariohasgrupo.fechaCreacion,
        usuariohasgrupo.fechaActualizacion,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El usuario_has_grupo ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-usuariohasgrupo", async (c) => {
  let usuariohasgrupo = await c.req.json();
  return new Promise((resolve) => {
    mysqlConnection.query(
      "DELETE usuario_has_grupo WHERE usuario_DNI = ? AND grupo_idGrupo=?",
      [usuariohasgrupo.usuario_DNI, usuariohasgrupo.grupo_idGrupo],
      (err, rows, fields) => {
        if (!err) {
          rows.forEach((element) => {
            if (element.constructor == Array) {
              resolve(c.json("Insertado id: " + element[0].idusuario_has_grupo));
            }
          });
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/update-usuariohasgrupo", async (c) => {
  let usuariohasgrupo = await c.req.json();
  var sql =
    "UPDATE usuario_has_grupo SET usuario_DNI=?, grupo_idGrupo=?, fechaCreacion=?,fechaActualizacion=? WHERE  usuario_DNI=? AND grupo_idGrupo=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        usuariohasgrupo.usuario_DNI,
        usuariohasgrupo.grupo_idGrupo,
        usuariohasgrupo.fechaCreacion,
        usuariohasgrupo.fechaActualizacion,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El usuario_has_grupo ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
