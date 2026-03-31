const express = require("express");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const Router = express.Router();

Router.get("/get-permiso", (req, res) => {
  mysqlConnection.query("SELECT * from permiso", (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/post-permiso", checkToken, (req, res) => {
  let permiso = req.body;
  var sql = "INSERT INTO permiso (idPermiso, nombre, fechaCreacion, fechaActualizacion) VALUES(?,?,?,?);";
  mysqlConnection.query(
    sql,
    [permiso.idPermiso, permiso.nombre, permiso.fechaCreacion, permiso.fechaActualizacion],
    (err, rows, fields) => {
      if (!err) {
        res.send({ message: "El permiso ha sido guardada" });
      } else {
        console.log(err);
      }
    },
  );
});

Router.delete("/delete-permiso/:id", checkToken, (req, res) => {
  mysqlConnection.query("DELETE permiso WHERE idPermiso = ?", [req.params.id], (err, rows, fields) => {
    if (!err) {
      rows.forEach((element) => {
        if (element.constructor == Array) {
          res.send("Insertado id: " + element[0].idpermiso);
        }
      });
    } else {
      console.log(err);
    }
  });
});

Router.put("/update-permiso", checkToken, (req, res) => {
  let permiso = req.body;
  var sql = "UPDATE permiso SET idPermiso=?, nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idPermiso=?;";
  mysqlConnection.query(
    sql,
    [permiso.idpermiso, permiso.idPermiso, permiso.nombre, permiso.fechaCreacion, permiso.fechaActualizacion],
    (err, rows, fields) => {
      if (!err) {
        res.send({ message: "El permiso ha sido actualizada" });
      } else {
        console.log(err);
      }
    },
  );
});

module.exports = Router;
