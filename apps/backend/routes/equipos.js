const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const router = new Hono();

router.get("/get-equipo", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from equipo", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-equipo/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * FROM equipo WHERE idEquipo = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-equipo", checkToken, async (c) => {
  let not = await c.req.json();
  var sql = "INSERT INTO equipo (nombre,cpu,gpu,ram,hd, grupo_idGrupo) VALUES(?,?,?,?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [not.nombre, not.cpu, not.gpu, not.ram, not.hd, not.grupo_idGrupo],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "La equipo ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-equipo/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE FROM equipo WHERE idEquipo = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "El equipo ha sido eliminado" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-equipo", checkToken, async (c) => {
  let not = await c.req.json();
  var sql = "UPDATE equipo SET nombre=?,cpu=?,gpu=?,ram=?,hd=?, grupo_idGrupo=? WHERE  idEquipo=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [not.nombre, not.cpu, not.gpu, not.ram, not.hd, not.grupo_idGrupo, not.idEquipo],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "El equipo ha sido actualizado" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
