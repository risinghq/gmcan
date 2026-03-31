const express = require("express");
const mysqlConnection = require("./../connection");
const { checkToken } = require("../auth/token_validation");

var fs = require("fs");
var path = require("path");
const multer = require("multer");
const md_upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads/sobrenosotros",
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
}).any();

const Router = express.Router();

Router.get("/get-sobrenosotros", (req, res) => {
  mysqlConnection.query("SELECT * from sobrenosotros", (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.get("/get-sobrenosotros-en", (req, res) => {
  mysqlConnection.query(
    "SELECT idSobreNosotros, quienesSomosResumenEN as 'quienesSomosResumen', quienesSomosEN as 'quienesSomos', objetivosEN as 'objetivos', serviciosEN as 'servicios' from sobrenosotros",
    (err, rows, fields) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    },
  );
});

Router.put("/update-descripciongrupo", (req, res) => {
  let sobrenosotros = req.body;
  var sql = "UPDATE sobrenosotros SET quienesSomos=?, quienesSomosEN=? WHERE idSobreNosotros=?;";
  mysqlConnection.query(
    sql,
    [sobrenosotros.quienesSomos, sobrenosotros.quienesSomosEN, sobrenosotros.idSobreNosotros],
    (err, rows, fields) => {
      if (!err) {
        res.send({ status: 1, message: "Ha sido actualizado" });
      } else {
        console.log(err);
      }
    },
  );
});

Router.put("/update-objetivosgrupo", checkToken, (req, res) => {
  let sobrenosotros = req.body;
  var sql = "UPDATE sobrenosotros SET objetivos=?, objetivosEN=? WHERE  idSobreNosotros=?;";
  mysqlConnection.query(
    sql,
    [sobrenosotros.objetivos, sobrenosotros.objetivosEN, sobrenosotros.idSobreNosotros],
    (err, rows, fields) => {
      if (!err) {
        res.send({ status: 1, message: "Ha sido actualizado" });
      } else {
        console.log(err);
      }
    },
  );
});

Router.put("/update-serviciosgrupo", checkToken, (req, res) => {
  let sobrenosotros = req.body;
  var sql = "UPDATE sobrenosotros SET servicios=?, serviciosEN=? WHERE  idSobreNosotros=?;";
  mysqlConnection.query(
    sql,
    [sobrenosotros.servicios, sobrenosotros.serviciosEN, sobrenosotros.idSobreNosotros],
    (err, rows, fields) => {
      if (!err) {
        res.send({ status: 1, message: "Ha sido actualizado" });
      } else {
        console.log(err);
      }
    },
  );
});

Router.put("/upload-sobrenosotros-foto/:id", checkToken, md_upload, (req, res) => {
  let sobrenosotros = req.body;
  if (req.files && req.files.length > 0) {
    var file = req.files[0];
    sobrenosotros.foto = file.filename;
    var file_ext = path.extname(file.originalname).slice(1).toLowerCase();
    var sql = "UPDATE sobrenosotros SET foto=? WHERE idSobreNosotros=" + req.params.id + ";";
    if (file_ext == "png" || file_ext == "jpg" || file_ext == "jpeg") {
      mysqlConnection.query(sql, [sobrenosotros.foto], (err, rows, fields) => {
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

Router.get("/get-image-sobrenosotros/:imageFile", (req, res) => {
  var imageFile = req.params.imageFile;
  var path_file = "./uploads/sobrenosotros/" + imageFile;
  fs.exists(path_file, function (exists) {
    if (exists) {
      res.sendFile(path.resolve(path_file));
    } else {
      res.status(200).send({ message: "no existe la imagen" });
    }
  });
});

module.exports = Router;
