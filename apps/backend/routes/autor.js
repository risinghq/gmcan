const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const router = new Hono();

router.get("/get-autor", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from autor", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-autor/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from autor WHERE idAutor=?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/search-autores", async (c) => {
  let autor = await c.req.json();
  autor.nombre = "%" + autor.nombre + "%";
  var sql = "SELECT * from autor WHERE nombre LIKE ?";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [autor.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-autor", checkToken, async (c) => {
  let autor = await c.req.json();
  var sql = "INSERT INTO autor (nombre) VALUES(?);";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [autor.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ idAutor: rows.insertId, message: "El autor ha sido guardada" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.delete("/delete-autor/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE autor WHERE idautor = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        rows.forEach((element) => {
          if (element.constructor == Array) {
            resolve(c.json("Insertado id: " + element[0].idautor));
          }
        });
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-autor", async (c) => {
  let autor = await c.req.json();
  var sql = "UPDATE autor SET nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idautor=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [autor.idautor, autor.nombre, autor.fechaCreacion, autor.fechaActualizacion],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El autor ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
