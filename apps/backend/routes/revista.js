const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const router = new Hono();

router.get("/get-revista", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from revista", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-revista/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * FROM revista WHERE idRevista = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/search-revistas", async (c) => {
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

router.post("/post-revista", checkToken, async (c) => {
  let not = await c.req.json();
  var sql = "INSERT INTO revista (nombre) VALUES(?);";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [not.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "La revista ha sido guardada" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.delete("/delete-revista/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE FROM revista WHERE idRevista = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "Eliminado revista" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-revista", checkToken, async (c) => {
  let not = await c.req.json();
  var sql = "UPDATE revista SET nombre=? WHERE idRevista=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [not.nombre, not.idRevista], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "La revista ha sido actualizada" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

module.exports = router;
