const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const router = new Hono();

router.get("/get-tipopermiso", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from tipopermiso", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-tipopermiso", checkToken, async (c) => {
  let tipopermiso = await c.req.json();
  var sql = "INSERT INTO tipopermiso (idTipoPermiso, nombre, fechaCreacion, fechaActualizacion) VALUES(?,?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [tipopermiso.idTipoPermiso, tipopermiso.nombre, tipopermiso.fechaCreacion, tipopermiso.fechaActualizacion],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El tipopermiso ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-tipopermiso/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE tipopermiso WHERE idTipoPermiso = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        rows.forEach((element) => {
          if (element.constructor == Array) {
            resolve(c.json("Insertado id: " + element[0].idtipopermiso));
          }
        });
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-tipopermiso", checkToken, async (c) => {
  let tipopermiso = await c.req.json();
  var sql =
    "UPDATE tipopermiso SET idTipoPermiso=?, nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idTipoPermiso=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        tipopermiso.idtipopermiso,
        tipopermiso.idTipoPermiso,
        tipopermiso.nombre,
        tipopermiso.fechaCreacion,
        tipopermiso.fechaActualizacion,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El tipopermiso ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
