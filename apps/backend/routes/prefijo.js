const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const router = new Hono();

router.get("/get-prefijo", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from prefijo", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-prefijo", checkToken, async (c) => {
  let prefijo = await c.req.json();
  var sql = "INSERT INTO prefijo (idPrefijo, nombre, fechaCreacion, fechaActualizacion) VALUES(?,?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [prefijo.idPrefijo, prefijo.nombre, prefijo.fechaCreacion, prefijo.fechaActualizacion],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El prefijo ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-prefijo/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE prefijo WHERE idPrefijo = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        rows.forEach((element) => {
          if (element.constructor == Array) {
            resolve(c.json("Insertado id: " + element[0].idprefijo));
          }
        });
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-prefijo", checkToken, async (c) => {
  let prefijo = await c.req.json();
  var sql = "UPDATE prefijo SET idPrefijo=?, nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idPrefijo=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [prefijo.idprefijo, prefijo.idPrefijo, prefijo.nombre, prefijo.fechaCreacion, prefijo.fechaActualizacion],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El prefijo ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
