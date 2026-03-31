const express = require("express");
const mysqlConnection = require("../connection");

const Router = express.Router();

const { checkToken } = require("../auth/token_validation");
var fs = require("fs");
var path = require("path");
const multer = require("multer");
const md_upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads/metodos",
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
}).any();

Router.get("/get-metodo", (req, res) => {
  mysqlConnection.query("SELECT * from metodo", (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.get("/get-metodo-en", (req, res) => {
  mysqlConnection.query(
    "SELECT idMetodo, nombreEN as 'nombre', descripcionEN as 'descripcion', foto, fechaActualizacion, grupo_idGrupo from metodo",
    (err, rows, fields) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    },
  );
});

Router.get("/get-metodo/:id", (req, res) => {
  mysqlConnection.query("SELECT * FROM metodo WHERE idMetodo = ?", [req.params.id], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.get("/get-metodo-en/:id", (req, res) => {
  mysqlConnection.query(
    "SELECT idMetodo, nombreEN as 'nombre', descripcionEN as 'descripcion', foto, fechaActualizacion, grupo_idGrupo from metodo WHERE idMetodo = ?",
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

Router.post("/post-metodo", checkToken, (req, res) => {
  let not = req.body;
  var sql = "INSERT INTO metodo (nombre,nombreEN,descripcion,descripcionEN, grupo_idGrupo) VALUES(?,?,?,?,?);";
  mysqlConnection.query(
    sql,
    [not.nombre, not.nombreEN, not.descripcion, not.descripcionEN, not.grupo_idGrupo],
    (err, rows, fields) => {
      if (!err) {
        res.send({ status: 1, idMetodo: rows.insertId, message: "El método ha sido guardada" });
      } else {
        console.log(err);
      }
    },
  );
});

Router.delete("/delete-metodo/:id", checkToken, (req, res) => {
  mysqlConnection.query("DELETE FROM metodo WHERE idMetodo = ?", [req.params.id], (err, rows, fields) => {
    if (!err) {
      res.send({ status: 1, message: "El método ha sido eliminado" });
    } else {
      console.log(err);
    }
  });
});

Router.put("/update-metodo", checkToken, (req, res) => {
  let not = req.body;
  var sql =
    "UPDATE metodo SET nombre=?, nombreEN=?, descripcion=?, descripcionEN=?, grupo_idGrupo=? WHERE  idMetodo=?;";
  mysqlConnection.query(
    sql,
    [not.nombre, not.nombreEN, not.descripcion, not.descripcionEN, not.grupo_idGrupo, not.idMetodo],
    (err, rows, fields) => {
      if (!err) {
        res.send({ status: 1, message: "La metodo ha sido actualizada" });
      } else {
        console.log(err);
      }
    },
  );
});

Router.put("/upload-metodo-foto/:id", checkToken, md_upload, (req, res) => {
  let metodo = req.body;
  if (req.files && req.files.length > 0) {
    var file = req.files[0];
    metodo.foto = file.filename;
    var file_ext = path.extname(file.originalname).slice(1).toLowerCase();
    var sql = "UPDATE metodo SET foto=? WHERE idMetodo=" + req.params.id + ";";
    if (file_ext == "png" || file_ext == "jpg" || file_ext == "jpeg") {
      mysqlConnection.query(sql, [metodo.foto], (err, rows, fields) => {
        if (!err) {
          res.send(rows);
        } else {
          console.log(sql);
        }
      });
    } else {
      res.status(200).send({ message: "Extensión del archivo no válida" });
    }
  } else {
    return res.status(200).send({ message: "No has subido ninguna imagen" });
  }
});

Router.get("/get-image-metodo/:imageFile", (req, res) => {
  var imageFile = req.params.imageFile;
  var path_file = "./uploads/metodos/" + imageFile;
  fs.exists(path_file, function (exists) {
    if (exists) {
      res.sendFile(path.resolve(path_file));
    } else {
      res.status(200).send({ message: "no existe la imagen" });
    }
  });
});

module.exports = Router;
