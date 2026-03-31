const { Hono } = require("hono");
const mysqlConnection = require("../connection");

const router = new Hono();
const { checkToken } = require("../auth/token_validation");

router.get("/get-tiponoticia", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from tiponoticia", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-tiponoticia-en", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT idtipoNoticia, nombreEN as 'nombre' from tiponoticia", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-tiponoticia/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * FROM tiponoticia WHERE idtipoNoticia = ?",
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

router.get("/get-tiponoticia-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idtipoNoticia, nombreEN as 'nombre' FROM tiponoticia WHERE idtipoNoticia = ?",
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

router.post("/search-tiponoticia-global", async (c) => {
  let tiponoticia = await c.req.json();
  tiponoticia.nombre = "%" + tiponoticia.nombre + "%";
  var sql = "SELECT * from tiponoticia WHERE nombre LIKE ? ;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [tiponoticia.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/search-tiponoticia-global-en", async (c) => {
  let tiponoticia = await c.req.json();
  tiponoticia.nombre = "%" + tiponoticia.nombre + "%";
  var sql = "SELECT * from tiponoticia WHERE nombreEN LIKE ? ;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [tiponoticia.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-tiponoticia", checkToken, async (c) => {
  let not = await c.req.json();
  var sql = "INSERT INTO tiponoticia (nombre, nombreEN) VALUES(?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [not.nombre, not.nombreEN], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "La tipo tiponoticia ha sido guardada" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.delete("/delete-tiponoticia/:id", checkToken, (c) => {
  var sql = "DELETE FROM tiponoticia WHERE idtipoNoticia = ?";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "Eliminado tipo de tiponoticia" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-tiponoticia", checkToken, async (c) => {
  let not = await c.req.json();
  var sql = "UPDATE tiponoticia SET nombre=?, nombreEN=?  WHERE idtipoNoticia=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [not.nombre, not.nombreEN, not.idtipoNoticia], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "La tiponoticia ha sido actualizada" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

module.exports = router;
