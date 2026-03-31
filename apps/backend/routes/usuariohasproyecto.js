const express = require("express");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const Router = express.Router();

Router.get("/get-usuariohasproyecto", (req, res) => {
  mysqlConnection.query("SELECT * from usuario_has_proyecto", (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.get("/get-usuariohasproyecto/:id", (req, res) => {
  mysqlConnection.query(
    "SELECT * FROM usuario_has_proyecto WHERE proyecto_idProyecto = ?",
    [req.params.id],
    (err, rows, fields) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    },
  );
});

Router.get("/get-usuariohasproyectos/:id", (req, res) => {
  mysqlConnection.query(
    "SELECT * FROM usuario_has_proyecto WHERE usuario_DNI = ?;",
    [req.params.id],
    (err, rows, fields) => {
      if (!err) {
        res.send(rows);
      } else {
      }
    },
  );
});

Router.post("/post-usuariohasproyecto", checkToken, (req, res) => {
  let usuariohasproyecto = req.body;
  var sql = "INSERT INTO usuario_has_proyecto (proyecto_idProyecto, usuario_DNI) VALUES(?,?);";
  mysqlConnection.query(
    sql,
    [usuariohasproyecto.proyecto_idProyecto, usuariohasproyecto.usuario_DNI],
    (err, rows, fields) => {
      if (!err) {
        res.send({ status: 1, message: "El usuariohasproyecto ha sido guardada" });
      } else {
        console.log(err);
      }
    },
  );
});

Router.delete("/delete-usuariohasproyecto/:id", checkToken, (req, res) => {
  mysqlConnection.query(
    "DELETE FROM usuario_has_proyecto WHERE proyecto_idProyecto = ?",
    [req.params.id],
    (err, rows, fields) => {
      if (!err) {
        res.send({ status: 1, message: "El publicacion_has_usuario ha sido actualizada" });
      } else {
        console.log(err);
      }
    },
  );
});

module.exports = Router;
