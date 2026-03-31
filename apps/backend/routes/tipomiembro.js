const { Hono } = require("hono");
const mysqlConnection = require("../connection");

const router = new Hono();

router.get("/get-tipomiembro", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from tipomiembro", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-tipomiembro-en", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idTipoMiembro, nombreEN as 'nombre', nombreSingularEN as 'nombreSingular' from tipomiembro",
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

router.post("/post-tipomiembro", async (c) => {
  let tipomiembro = await c.req.json();
  var sql = "INSERT INTO tipomiembro (idTipoMiembro, nombre, fechaCreacion, fechaActualizacion) VALUES(?,?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [tipomiembro.idTipoMiembro, tipomiembro.nombre, tipomiembro.fechaCreacion, tipomiembro.fechaActualizacion],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El tipomiembro ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-tipomiembro/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE tipomiembro WHERE idTipoMiembro = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        rows.forEach((element) => {
          if (element.constructor == Array) {
            resolve(c.json("Insertado id: " + element[0].idtipomiembro));
          }
        });
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-tipomiembro", async (c) => {
  let tipomiembro = await c.req.json();
  var sql =
    "UPDATE tipomiembro SET idTipoMiembro=?, nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idTipoMiembro=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        tipomiembro.idtipomiembro,
        tipomiembro.idTipoMiembro,
        tipomiembro.nombre,
        tipomiembro.fechaCreacion,
        tipomiembro.fechaActualizacion,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El tipomiembro ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;

//INSERT INTO `tesis`.`tipomiembro` (`idTipoMiembro`, `nombre`, `fechaCreacion`, `fechaActualizacion`) VALUES ('1', 'Administrador', '2020-01-15', '2020-01-15');
