const express = require("express");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const Router = express.Router();

Router.get("/get-equipo", (req, res) => {
  mysqlConnection.query("SELECT * from equipo", (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.get("/get-equipo/:id", (req, res) => {
  mysqlConnection.query("SELECT * FROM equipo WHERE idEquipo = ?", [req.params.id], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/post-equipo", checkToken, (req, res) => {
  let not = req.body;
  var sql = "INSERT INTO equipo (nombre,cpu,gpu,ram,hd, grupo_idGrupo) VALUES(?,?,?,?,?,?);";
  mysqlConnection.query(
    sql,
    [not.nombre, not.cpu, not.gpu, not.ram, not.hd, not.grupo_idGrupo],
    (err, rows, fields) => {
      if (!err) {
        res.send({ status: 1, message: "La equipo ha sido guardada" });
      } else {
        console.log(err);
      }
    },
  );
});

Router.delete("/delete-equipo/:id", checkToken, (req, res) => {
  mysqlConnection.query("DELETE FROM equipo WHERE idEquipo = ?", [req.params.id], (err, rows, fields) => {
    if (!err) {
      res.send({ status: 1, message: "El equipo ha sido eliminado" });
    } else {
      console.log(err);
    }
  });
});

Router.put("/update-equipo", checkToken, (req, res) => {
  let not = req.body;
  var sql = "UPDATE equipo SET nombre=?,cpu=?,gpu=?,ram=?,hd=?, grupo_idGrupo=? WHERE  idEquipo=?;";
  mysqlConnection.query(
    sql,
    [not.nombre, not.cpu, not.gpu, not.ram, not.hd, not.grupo_idGrupo, not.idEquipo],
    (err, rows, fields) => {
      if (!err) {
        res.send({ status: 1, message: "El equipo ha sido actualizado" });
      } else {
        console.log(err);
      }
    },
  );
});

module.exports = Router;
