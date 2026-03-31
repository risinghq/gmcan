const { Hono } = require("hono");
const mysqlConnection = require("../connection");

const router = new Hono();

router.get("/get-tipopublicacion", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from tipopublicacion", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-tipopublicacion-en", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idTipoPublicacion, nombreEN as 'nombre' from tipopublicacion",
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

router.get("/get-tipopublicacion/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * FROM tipopublicacion WHERE idTipoPublicacion = ?",
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

router.get("/get-tipopublicacion-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idTipoPublicacion, nombreEN as 'nombre' FROM tipopublicacion WHERE idTipoPublicacion = ?",
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

router.post("/search-tipopublicacion", async (c) => {
  let revista = await c.req.json();
  revista.nombre = "%" + revista.nombre + "%";
  var sql = "SELECT * from revista WHERE nombre LIKE ?";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [revista.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/search-tipopublicacion-en", async (c) => {
  let revista = await c.req.json();
  revista.nombre = "%" + revista.nombre + "%";
  var sql = "SELECT idTipoPublicacion, nombreEN as 'nombre' from revista WHERE nombreEN LIKE ?";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [revista.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-tipopublicacion", async (c) => {
  let tipopublicacion = await c.req.json();
  var sql = "INSERT INTO tipopublicacion (nombre, fechaActualizacion, fechaCreacion) VALUES(?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [tipopublicacion.nombre, tipopublicacion.fechaCreacion, tipopublicacion.fechaActualizacion],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El tipopublicacion ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-tipopublicacion/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "DELETE tipopublicacion WHERE idTipoPublicacion = ?",
      [c.req.param("id")],
      (err, rows, fields) => {
        if (!err) {
          rows.forEach((element) => {
            if (element.constructor == Array) {
              resolve(c.json("Insertado id: " + element[0].idtipopublicacion));
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

router.put("/update-tipopublicacion", async (c) => {
  let tipopublicacion = await c.req.json();
  var sql = "UPDATE tipopublicacion SET nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idTipoPublicacion=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        tipopublicacion.idTipoPublicacion,
        tipopublicacion.nombre,
        tipopublicacion.fechaCreacion,
        tipopublicacion.fechaActualizacion,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El tipopublicacion ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
