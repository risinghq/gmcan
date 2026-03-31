const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const router = new Hono();

router.get("/get-universidad", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from universidad", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-universidad-en", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT idUniversidad, nombreEn as 'nombre' from universidad", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-universidad/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * from universidad WHERE idUniversidad=?",
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

router.get("/get-universidad-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idUniversidad, nombreEN as 'nombre' from universidad WHERE idUniversidad=?",
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

router.post("/search-universidad", async (c) => {
  let universidad = await c.req.json();
  universidad.nombre = "%" + universidad.titulo + "%";
  var sql = "SELECT * from universidad WHERE nombre LIKE ?";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [universidad.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/search-universidad-en", async (c) => {
  let universidad = await c.req.json();
  universidad.nombre = "%" + universidad.nombre + "%";
  var sql = "SELECT idUniversidad, nombreEN as 'nombre' from universidad WHERE nombreEN LIKE ?";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [universidad.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-universidad", checkToken, async (c) => {
  let universidad = await c.req.json();
  var sql = "INSERT INTO universidad (nombre, nombreEN) VALUES(?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [universidad.nombre, universidad.nombreEN], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "El universidad ha sido guardada" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.delete("/delete-universidad/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "DELETE FROM universidad WHERE idUniversidad = ?",
      [c.req.param("id")],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "Eliminada universidad" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/update-universidad", checkToken, async (c) => {
  let universidad = await c.req.json();
  var sql = "UPDATE universidad SET nombre=?, nombreEN=? WHERE  idUniversidad=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [universidad.nombre, universidad.nombreEN, universidad.idUniversidad],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El universidad ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
