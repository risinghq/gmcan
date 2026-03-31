const { Hono } = require("hono");
const mysqlConnection = require("../connection");

const router = new Hono();

router.get("/get-fuentefinanciamiento", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from fuenteFinanciamiento", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-fuentefinanciamiento/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * FROM fuenteFinanciamiento WHERE idFuenteFinanciamiento = ?",
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

router.post("/post-fuentefinanciamiento", async (c) => {
  let fuentefinanciamiento = await c.req.json();
  var sql = "INSERT INTO fuenteFinanciamiento (nombre) VALUES(?);";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [fuentefinanciamiento.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "La fuente ha sido guardada" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.delete("/delete-fuentefinanciamiento/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "DELETE FROM fuenteFinanciamiento WHERE idFuenteFinanciamiento  = ?",
      [c.req.param("id")],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "Eliminado tipo de noticia" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/update-fuentefinanciamiento", async (c) => {
  let fuentefinanciamiento = await c.req.json();
  var sql = "UPDATE fuenteFinanciamiento SET nombre=? WHERE idFuenteFinanciamiento = ?";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [fuentefinanciamiento.nombre, fuentefinanciamiento.idFuenteFinanciamiento],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "La fuentefinanciamiento ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
