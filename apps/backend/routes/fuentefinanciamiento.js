const express = require("express");
const mysqlConnection = require("../connection");

const Router = express.Router();

Router.get("/get-fuentefinanciamiento", (req, res) => {
  mysqlConnection.query("SELECT * from fuenteFinanciamiento", (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.get("/get-fuentefinanciamiento/:id", (req, res) => {
  mysqlConnection.query(
    "SELECT * FROM fuenteFinanciamiento WHERE idFuenteFinanciamiento = ?",
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

Router.post("/post-fuentefinanciamiento", (req, res) => {
  let fuentefinanciamiento = req.body;
  var sql = "INSERT INTO fuenteFinanciamiento (nombre) VALUES(?);";
  mysqlConnection.query(sql, [fuentefinanciamiento.nombre], (err, rows, fields) => {
    if (!err) {
      res.send({ status: 1, message: "La fuente ha sido guardada" });
    } else {
      console.log(err);
    }
  });
});

Router.delete("/delete-fuentefinanciamiento/:id", (req, res) => {
  mysqlConnection.query(
    "DELETE FROM fuenteFinanciamiento WHERE idFuenteFinanciamiento  = ?",
    [req.params.id],
    (err, rows, fields) => {
      if (!err) {
        res.send({ status: 1, message: "Eliminado tipo de noticia" });
      } else {
        console.log(err);
      }
    },
  );
});

Router.put("/update-fuentefinanciamiento", (req, res) => {
  let fuentefinanciamiento = req.body;
  var sql = "UPDATE fuenteFinanciamiento SET nombre=? WHERE idFuenteFinanciamiento = ?";
  mysqlConnection.query(
    sql,
    [fuentefinanciamiento.nombre, fuentefinanciamiento.idFuenteFinanciamiento],
    (err, rows, fields) => {
      if (!err) {
        res.send({ status: 1, message: "La fuentefinanciamiento ha sido actualizada" });
      } else {
        console.log(err);
      }
    },
  );
});

module.exports = Router;
