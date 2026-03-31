const { Hono } = require("hono");
const mysqlConnection = require("../connection");

const router = new Hono();

router.get("/get-moneda", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from moneda", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-moneda/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * FROM moneda WHERE idMoneda = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

module.exports = router;
