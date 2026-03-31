const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const router = new Hono();

router.get("/get-permiso", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from permiso", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-permiso", checkToken, async (c) => {
  let permiso = await c.req.json();
  var sql = "INSERT INTO permiso (idPermiso, nombre, fechaCreacion, fechaActualizacion) VALUES(?,?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [permiso.idPermiso, permiso.nombre, permiso.fechaCreacion, permiso.fechaActualizacion],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El permiso ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-permiso/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE permiso WHERE idPermiso = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        rows.forEach((element) => {
          if (element.constructor == Array) {
            resolve(c.json("Insertado id: " + element[0].idpermiso));
          }
        });
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-permiso", checkToken, async (c) => {
  let permiso = await c.req.json();
  var sql = "UPDATE permiso SET idPermiso=?, nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idPermiso=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [permiso.idpermiso, permiso.idPermiso, permiso.nombre, permiso.fechaCreacion, permiso.fechaActualizacion],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El permiso ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
