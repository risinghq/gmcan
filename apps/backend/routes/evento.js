const { Hono } = require("hono");
const mysqlConnection = require("../connection");

const router = new Hono();

router.get("/get-evento", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from evento", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-evento-en", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idEvento, nombre, paisEN as 'pais', ciudadEN as 'ciudad' from evento",
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

router.get("/get-evento/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * FROM evento WHERE idEvento = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-evento-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idEvento, nombre, paisEN as 'pais', ciudadEN as 'ciudad' FROM evento WHERE idEvento = ?",
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

router.post("/search-eventos", async (c) => {
  let evento = await c.req.json();
  evento.nombre = "%" + evento.nombre + "%";
  var sql = "SELECT * from evento WHERE nombre LIKE ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [evento.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-evento", async (c) => {
  let evento = await c.req.json();
  var sql = "INSERT INTO evento (nombre, ciudad, ciudadEN, pais, paisEN) VALUES(?,?,?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [evento.nombre, evento.ciudad, evento.ciudadEN, evento.pais, evento.paisEN],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "La tipo noticia ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-evento/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE FROM evento WHERE idEvento = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "Eliminado tipo de noticia" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-evento", async (c) => {
  let evento = await c.req.json();
  var sql = "UPDATE evento SET nombre=?, ciudad=?, ciudadEN=?, pais=?, paisEN=? WHERE idEvento=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [evento.nombre, evento.ciudad, evento.ciudadEN, evento.pais, evento.paisEN, evento.idEvento],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "La evento ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
