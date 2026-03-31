const express = require("express");
const mysqlConnection = require("../connection");

const Router = express.Router();
const { checkToken } = require("../auth/token_validation");

Router.get("/get-tiponoticia", (req, res) => {
  mysqlConnection.query("SELECT * from tiponoticia", (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.get("/get-tiponoticia-en", (req, res) => {
  mysqlConnection.query("SELECT idtipoNoticia, nombreEN as 'nombre' from tiponoticia", (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.get("/get-tiponoticia/:id", (req, res) => {
  mysqlConnection.query("SELECT * FROM tiponoticia WHERE idtipoNoticia = ?", [req.params.id], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.get("/get-tiponoticia-en/:id", (req, res) => {
  mysqlConnection.query(
    "SELECT idtipoNoticia, nombreEN as 'nombre' FROM tiponoticia WHERE idtipoNoticia = ?",
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

Router.post("/search-tiponoticia-global", (req, res) => {
  let tiponoticia = req.body;
  tiponoticia.nombre = "%" + tiponoticia.nombre + "%";
  var sql = "SELECT * from tiponoticia WHERE nombre LIKE ? ;";
  mysqlConnection.query(sql, [tiponoticia.nombre], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/search-tiponoticia-global-en", (req, res) => {
  let tiponoticia = req.body;
  tiponoticia.nombre = "%" + tiponoticia.nombre + "%";
  var sql = "SELECT * from tiponoticia WHERE nombreEN LIKE ? ;";
  mysqlConnection.query(sql, [tiponoticia.nombre], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/post-tiponoticia", checkToken, (req, res) => {
  let not = req.body;
  var sql = "INSERT INTO tiponoticia (nombre, nombreEN) VALUES(?,?);";
  mysqlConnection.query(sql, [not.nombre, not.nombreEN], (err, rows, fields) => {
    if (!err) {
      res.send({ status: 1, message: "La tipo tiponoticia ha sido guardada" });
    } else {
      console.log(err);
    }
  });
});

Router.delete("/delete-tiponoticia/:id", checkToken, (req, res) => {
  var sql = "DELETE FROM tiponoticia WHERE idtipoNoticia = ?";
  mysqlConnection.query(sql, [req.params.id], (err, rows, fields) => {
    if (!err) {
      res.send({ status: 1, message: "Eliminado tipo de tiponoticia" });
    } else {
      console.log(err);
    }
  });
});

Router.put("/update-tiponoticia", checkToken, (req, res) => {
  let not = req.body;
  var sql = "UPDATE tiponoticia SET nombre=?, nombreEN=?  WHERE idtipoNoticia=?;";
  mysqlConnection.query(sql, [not.nombre, not.nombreEN, not.idtipoNoticia], (err, rows, fields) => {
    if (!err) {
      res.send({ status: 1, message: "La tiponoticia ha sido actualizada" });
    } else {
      console.log(err);
    }
  });
});

module.exports = Router;
