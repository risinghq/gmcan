const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");
const router = new Hono();

router.get("/get-software", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from software", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-software-en", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idSoftware, nombre, descripcionEN as 'descripcion', moreInfo, fechaActualizacion, grupo_idGrupo from software",
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

router.get("/get-software/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * FROM software WHERE idSoftware = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-software-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idSoftware, nombre, descripcionEN as 'descripcion', moreInfo, fechaActualizacion, grupo_idGrupo from software WHERE idSoftware = ?",
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

router.post("/post-software", checkToken, async (c) => {
  let not = await c.req.json();
  var sql = "INSERT INTO software (nombre,descripcion,descripcionEN,moreInfo,grupo_idGrupo) VALUES(?,?,?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [not.nombre, not.descripcion, not.descripcionEN, not.moreInfo, not.grupo_idGrupo],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "La software ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-software/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE FROM software WHERE idSoftware = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "La software ha sido guardada" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-software", checkToken, async (c) => {
  let not = await c.req.json();
  var sql =
    "UPDATE software SET nombre=?, descripcion=?, descripcionEN=?, moreInfo=?, grupo_idGrupo=? WHERE  idSoftware=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [not.nombre, not.descripcion, not.descripcionEN, not.moreInfo, not.grupo_idGrupo, not.idSoftware],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "La software ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;
