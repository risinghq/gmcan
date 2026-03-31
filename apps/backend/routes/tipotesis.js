const { Hono } = require("hono");
const mysqlConnection = require("../connection");

const router = new Hono();

router.get("/get-tipotesis", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from tipotesis", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-tipotesis-en", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT idTipoTesis, nombreEN as 'nombre' from tipotesis", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-tipotesis/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * FROM tipotesis WHERE idTipoTesis = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-tipotesis-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idTipoTesis, nombreEN as 'nombre' FROM tipotesis WHERE idTipoTesis = ?",
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

router.post("/search-tipotesis", async (c) => {
  let tipotesis = await c.req.json();
  tipotesis.nombre = "%" + tipotesis.nombre + "%";
  var sql = "SELECT * from tipotesis WHERE nombre LIKE ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [tipotesis.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/search-tipotesis-en", async (c) => {
  let tipotesis = await c.req.json();
  tipotesis.nombre = "%" + tipotesis.nombre + "%";
  var sql = "SELECT idTipoTesis, nombreEN as 'nombre' from tipotesis WHERE nombreEN LIKE ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [tipotesis.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-tipotesis", async (c) => {
  let tipotesis = await c.req.json();
  var sql = "INSERT INTO tipotesis (nombre, fechaActualizacion, fechaCreacion) VALUES(?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [tipotesis.nombre, tipotesis.fechaCreacion, tipotesis.fechaActualizacion],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El tipotesis ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-tipotesis/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE tipotesis WHERE idTipoPublicacion = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        rows.forEach((element) => {
          if (element.constructor == Array) {
            resolve(c.json("Insertado id: " + element[0].idtipotesis));
          }
        });
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-tipotesis", async (c) => {
  let tipotesis = await c.req.json();
  var sql = "UPDATE tipotesis SET nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idTipoPublicacion=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [tipotesis.idTipoPublicacion, tipotesis.nombre, tipotesis.fechaCreacion, tipotesis.fechaActualizacion],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El tipotesis ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
