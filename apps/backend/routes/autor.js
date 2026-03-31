const express = require("express");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const Router = express.Router();

Router.get("/get-autor", (req, res) => {
  mysqlConnection.query("SELECT * from autor", (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.get("/get-autor/:id", (req, res) => {
  mysqlConnection.query("SELECT * from autor WHERE idAutor=?", [req.params.id], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/search-autores", (req, res) => {
  let autor = req.body;
  autor.nombre = "%" + autor.nombre + "%";
  var sql = "SELECT * from autor WHERE nombre LIKE ?";
  mysqlConnection.query(sql, [autor.nombre], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/post-autor", checkToken, (req, res) => {
  let autor = req.body;
  var sql = "INSERT INTO autor (nombre) VALUES(?);";
  mysqlConnection.query(sql, [autor.nombre], (err, rows, fields) => {
    if (!err) {
      res.send({ idAutor: rows.insertId, message: "El autor ha sido guardada" });
    } else {
      console.log(err);
    }
  });
});

Router.delete("/delete-autor/:id", (req, res) => {
  mysqlConnection.query("DELETE autor WHERE idautor = ?", [req.params.id], (err, rows, fields) => {
    if (!err) {
      rows.forEach((element) => {
        if (element.constructor == Array) {
          res.send("Insertado id: " + element[0].idautor);
        }
      });
    } else {
      console.log(err);
    }
  });
});

Router.put("/update-autor", (req, res) => {
  let autor = req.body;
  var sql = "UPDATE autor SET nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idautor=?;";
  mysqlConnection.query(
    sql,
    [autor.idautor, autor.nombre, autor.fechaCreacion, autor.fechaActualizacion],
    (err, rows, fields) => {
      if (!err) {
        res.send({ message: "El autor ha sido actualizada" });
      } else {
        console.log(err);
      }
    },
  );
});

module.exports = Router;
