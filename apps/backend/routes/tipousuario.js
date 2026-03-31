const { Hono } = require("hono");
const mysqlConnection = require("../connection");

const router = new Hono();

router.get("/get-tipousuario", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from tipouser", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-tipousuario", async (c) => {
  let tipouser = await c.req.json();
  var sql = "INSERT INTO tipousuario (idTipoUsuario, nombre, fechaCreacion, fechaActualizacion) VALUES(?,?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [tipouser.idTipoUsuario, tipouser.nombre, tipouser.fechaCreacion, tipouser.fechaActualizacion],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El tipousuario ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-tipousuario/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE tipousuario WHERE idTipoUsuario = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        rows.forEach((element) => {
          if (element.constructor == Array) {
            resolve(c.json("Insertado id: " + element[0].idtipousuario));
          }
        });
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-tipousuario", async (c) => {
  let tipouser = await c.req.json();
  var sql =
    "UPDATE tipousuario SET idTipoUsuario=?, nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idTipoUsuario=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        tipouser.idtipousuario,
        tipouser.idTipoUsuario,
        tipouser.nombre,
        tipouser.fechaCreacion,
        tipouser.fechaActualizacion,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ message: "El tipousuario ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

module.exports = router;

//INSERT INTO `tesis`.`tipouser` (`idTipoUsuario`, `nombre`, `fechaCreacion`, `fechaActualizacion`) VALUES ('1', 'Administrador', '2020-01-15', '2020-01-15');
