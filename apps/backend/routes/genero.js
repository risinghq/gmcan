const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const router = new Hono();

router.get("/get-genero", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from genero", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-genero", checkToken, async (c) => {
  let genero = await c.req.json();
  var sql = "INSERT INTO genero (idGenero, nombre, fechaCreacion, fechaActualizacion) VALUES(?,?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [genero.idGenero, genero.nombre, genero.fechaCreacion, genero.fechaActualizacion],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El genero ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-genero/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE genero WHERE idGenero = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        rows.forEach((element) => {
          if (element.constructor == Array) {
            resolve(c.json("Insertado id: " + element[0].idgenero));
          }
        });
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-genero", checkToken, async (c) => {
  let genero = await c.req.json();
  var sql = "UPDATE genero SET idGenero=?, nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idGenero=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [genero.idgenero, genero.idGenero, genero.nombre, genero.fechaCreacion, genero.fechaActualizacion],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El genero ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
