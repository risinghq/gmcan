const express = require("express");
const mysqlConnection = require("../connection");

const Router = express.Router();

Router.get("/get-usuariohasgrupo", (req, res) => {
  mysqlConnection.query("SELECT * from usuario_has_grupo", (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/post-usuariohasgrupo", (req, res) => {
  let usuariohasgrupo = req.body;
  var sql =
    "INSERT INTO usuario_has_grupo (usuario_DNI, grupo_idGrupo, fechaCreacion, fechaActualizacion) VALUES(?,?,?,?);";
  mysqlConnection.query(
    sql,
    [
      usuariohasgrupo.usuario_DNI,
      usuariohasgrupo.grupo_idGrupo,
      usuariohasgrupo.fechaCreacion,
      usuariohasgrupo.fechaActualizacion,
    ],
    (err, rows, fields) => {
      if (!err) {
        res.send({ message: "El usuario_has_grupo ha sido guardada" });
      } else {
        console.log(err);
      }
    },
  );
});

Router.delete("/delete-usuariohasgrupo", (req, res) => {
  let usuariohasgrupo = req.body;
  mysqlConnection.query(
    "DELETE usuario_has_grupo WHERE usuario_DNI = ? AND grupo_idGrupo=?",
    [usuariohasgrupo.usuario_DNI, usuariohasgrupo.grupo_idGrupo],
    (err, rows, fields) => {
      if (!err) {
        rows.forEach((element) => {
          if (element.constructor == Array) {
            res.send("Insertado id: " + element[0].idusuario_has_grupo);
          }
        });
      } else {
        console.log(err);
      }
    },
  );
});

Router.put("/update-usuariohasgrupo", (req, res) => {
  let usuariohasgrupo = req.body;
  var sql =
    "UPDATE usuario_has_grupo SET usuario_DNI=?, grupo_idGrupo=?, fechaCreacion=?,fechaActualizacion=? WHERE  usuario_DNI=? AND grupo_idGrupo=?;";
  mysqlConnection.query(
    sql,
    [
      usuariohasgrupo.usuario_DNI,
      usuariohasgrupo.grupo_idGrupo,
      usuariohasgrupo.fechaCreacion,
      usuariohasgrupo.fechaActualizacion,
    ],
    (err, rows, fields) => {
      if (!err) {
        res.send({ message: "El usuario_has_grupo ha sido actualizada" });
      } else {
        console.log(err);
      }
    },
  );
});

module.exports = Router;
