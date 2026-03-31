const express = require("express");
const mysqlConnection = require("../connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const randtoken = require("rand-token");
const refreshTokens = {};
const SECRET = "VERY_SECRET_KEY!";
const { checkToken } = require("../auth/token_validation");

var fs = require("fs");
var path = require("path");
const multer = require("multer");
const md_upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads/usuario",
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
}).any();

const Router = express.Router();

Router.get("/get-usuario", (req, res) => {
  mysqlConnection.query(
    "SELECT DNI, correo, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenPro, foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario",
    (err, rows, fields) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    },
  );
});

Router.get("/get-usuario-en", (req, res) => {
  mysqlConnection.query(
    "SELECT DNI, correo, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenProEN as 'resumenPro', foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario",
    (err, rows, fields) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    },
  );
});

Router.get("/get-usuario/:id", (req, res) => {
  mysqlConnection.query(
    "SELECT DNI, correo, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenPro, foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario WHERE DNI = ?",
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

Router.get("/get-usuario-en/:id", (req, res) => {
  mysqlConnection.query(
    "SELECT DNI, correo, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenProEN as 'resumenPro', foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo FROM usuario WHERE DNI = ?",
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

Router.get("/get-usuario-name", (req, res) => {
  mysqlConnection.query(
    "SELECT DNI, nombre, apellidoPaterno, apellidoMaterno, foto from usuario",
    (err, rows, fields) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    },
  );
});

Router.get("/get-usuario-full/:id", checkToken, (req, res) => {
  mysqlConnection.query(
    "SELECT DNI, correo, password, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenPro, resumenProEN, foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo, genero_idGenero FROM usuario WHERE DNI = ?",
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

Router.post("/search-usuarios", (req, res) => {
  let usuario = req.body;
  usuario.nombre = "%" + usuario.nombre + "%";
  var sql =
    "SELECT DNI, correo, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenPro, foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario WHERE nombre LIKE ? OR apellidoPaterno LIKE ? OR apellidoMaterno LIKE ?;";
  mysqlConnection.query(sql, [usuario.nombre, usuario.nombre, usuario.nombre], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/search-usuarios-global", (req, res) => {
  let usuario = req.body;
  usuario.nombre = "%" + usuario.nombre + "%";
  var sql =
    "SELECT DNI, correo, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenPro, foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario WHERE nombre LIKE ? OR apellidoPaterno LIKE ? OR apellidoMaterno LIKE ? OR correo LIKE ?;";
  mysqlConnection.query(sql, [usuario.nombre, usuario.nombre, usuario.nombre, usuario.nombre], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/post-usuario", checkToken, (req, res) => {
  let user = req.body;
  user.password = bcrypt.hashSync(user.password, 10);
  var sql =
    "INSERT INTO usuario (DNI, correo, password, nombre, apellidoPaterno, apellidoMaterno, resumenPro, resumenProEN, fechaNacimiento, estado, restablecer, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo, genero_idGenero) VALUES(?,?,?,?,?,?,?,?,?,?,0,?,?,?,?);";
  mysqlConnection.query(
    sql,
    [
      user.DNI,
      user.correo,
      user.password,
      user.nombre,
      user.apellidoPaterno,
      user.apellidoMaterno,
      user.resumenPro,
      user.resumenProEN,
      user.fechaNacimiento,
      user.estado,
      user.tipoUsuario_idTipoUsuario,
      user.tipoMiembro_idTipoMiembro,
      user.prefijo_idPrefijo,
      user.genero_idGenero,
    ],
    (err, rows, fields) => {
      if (!err) {
        res.send({ user: user.DNI, message: "El usuario ha sido guardada" });
      } else {
        console.log(err);
      }
    },
  );
});

Router.delete("/delete-usuario/:id", checkToken, (req, res) => {
  mysqlConnection.query("DELETE FROM usuario WHERE DNI = ?", [req.params.id], (err, rows, fields) => {
    if (!err) {
      res.send({ status: 1 });
    } else {
      console.log(err);
    }
  });
});

Router.put("/update-usuario", checkToken, (req, res) => {
  let user = req.body;
  var sql =
    "UPDATE usuario SET correo=?, nombre=?, apellidoPaterno=?, apellidoMaterno=?, resumenPro=?, resumenProEN=?, fechaNacimiento=?, estado=?, tipoUsuario_idTipoUsuario=?, tipoMiembro_idTipoMiembro=?, prefijo_idPrefijo=?, genero_idGenero=? WHERE DNI=?;";
  mysqlConnection.query(
    sql,
    [
      user.correo,
      user.nombre,
      user.apellidoPaterno,
      user.apellidoMaterno,
      user.resumenPro,
      user.resumenProEN,
      user.fechaNacimiento,
      user.estado,
      user.tipoUsuario_idTipoUsuario,
      user.tipoMiembro_idTipoMiembro,
      user.prefijo_idPrefijo,
      user.genero_idGenero,
      user.DNI,
    ],
    (err, rows, fields) => {
      if (!err) {
        res.send({ status: 1, user: user.DNI, message: "El usuario ha sido actualizada" });
      } else {
        console.log(err);
      }
    },
  );
});

Router.put("/upload-usuario-file/:id", checkToken, md_upload, (req, res) => {
  let usuario = req.body;
  var sql = "UPDATE usuario SET foto=? WHERE DNI=" + req.params.id + ";";
  if (req.files && req.files.length > 0) {
    var file = req.files[0];
    usuario.image = file.filename;
    var file_ext = path.extname(file.originalname).slice(1).toLowerCase();
    if (file_ext == "png" || file_ext == "jpg" || file_ext == "jpeg") {
      mysqlConnection.query(sql, [usuario.image], (err, rows, fields) => {
        if (!err) {
          res.send(rows);
        } else {
          console.log(err);
        }
      });
    } else {
      res.status(200).send({ message: "Extensión del archivo no válida" });
    }
  } else {
    return res.status(200).send({ message: "No has subido ninguna imagen" });
  }
});

Router.get("/get-image-usuario/:imageFile", (req, res) => {
  var imageFile = req.params.imageFile;
  var path_file = "./uploads/usuario/" + imageFile;
  fs.exists(path_file, function (exists) {
    if (exists) {
      res.sendFile(path.resolve(path_file));
    } else {
      res.status(200).send({ message: "no existe la imagen" });
    }
  });
});

//Login user
Router.post("/login", (req, res) => {
  let usuario = req.body;
  var sql =
    "SELECT DNI, correo, password, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenPro, foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario WHERE correo = ?;";
  mysqlConnection.query(sql, [usuario.correo], (err, rows) => {
    if (!err && rows[0]) {
      if (bcrypt.compareSync(usuario.password, rows[0].password)) {
        rows[0].password = undefined;
        const { correo, password } = req.body;
        const user = {
          correo: correo,
          role: "admin",
        };
        const token = jwt.sign(user, SECRET, { expiresIn: 300 });
        const refreshToken = randtoken.uid(256);
        refreshTokens[refreshToken] = correo;
        res.json({ jwt: token, user: rows[0], refreshToken: refreshToken, state: 1 });
      } else {
        res.send({ message: "Contraseña incorrecta ", state: 2 });
      }
    } else {
      res.send({ message: "Correo no encontrado", state: 0 });
    }
  });
});

Router.post("/logout", function (req, res) {
  const refreshToken = req.body.refreshToken;
  if (refreshToken in refreshTokens) {
    delete refreshTokens[refreshToken];
  }
  res.sendStatus(204);
});

Router.post("/refresh", function (req, res) {
  const refreshToken = req.body.refreshToken;
  if (refreshToken in refreshTokens) {
    const user = {
      username: refreshTokens[refreshToken],
      role: "admin",
    };
    const token = jwt.sign(user, SECRET, { expiresIn: 300 });
    res.json({ jwt: token });
  } else {
    res.status(401).send({ message: "Unauthorized" });
  }
});

Router.put("/update-password", checkToken, (req, res) => {
  let user = req.body;
  user.password = bcrypt.hashSync(user.password, 10);
  var sql = "UPDATE usuario SET password=?, restablecer=0 WHERE correo=?;";
  mysqlConnection.query(sql, [user.password, user.correo], (err, rows, fields) => {
    if (!err) {
      res.send({ message: "La contraseña ha sido actualizada", state: 1 });
    } else {
      console.log(err);
    }
  });
});

Router.get("/check-res/:id", checkToken, (req, res) => {
  mysqlConnection.query("SELECT restablecer from usuario WHERE correo = ?", [req.params.id], (err, rows, fields) => {
    if (!err && rows[0]) {
      res.send({ state: rows[0].restablecer });
    } else {
      console.log(err);
    }
  });
});

Router.get("/get-usuario-active/:id", checkToken, (req, res) => {
  mysqlConnection.query(
    "SELECT DNI, nombre, apellidoPaterno, apellidoMaterno, correo, foto, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario WHERE estado=?",
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

Router.get("/get-usuario-verify/:id", checkToken, (req, res) => {
  mysqlConnection.query(
    "SELECT DNI, nombre, apellidoPaterno, apellidoMaterno, correo, foto, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario WHERE tipoMiembro_idTipoMiembro=?",
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

Router.post("/verify-email", checkToken, (req, res) => {
  let user = req.body;
  mysqlConnection.query("SELECT DNI from usuario WHERE correo=?", [user.correo], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/verify-DNI", checkToken, (req, res) => {
  let user = req.body;
  mysqlConnection.query("SELECT DNI from usuario WHERE DNI=?", [user.DNI], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

const DIR = "uploads/usuario";

Router.delete("/erase-image/:id", checkToken, (req, res) => {
  try {
    fs.unlinkSync(DIR + "/" + req.params.id);
    return res.send({ message: "Successfully! Image has been Deleted", status: 1 });
  } catch (err) {
    // handle the error
    return res.status(400).send(err);
  }
});

module.exports = Router;
