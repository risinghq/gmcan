const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const randtoken = require("rand-token");
const refreshTokens = {};
const SECRET = "VERY_SECRET_KEY!";
const { checkToken } = require("../auth/token_validation");

var fs = require("fs");
var path = require("path");

const router = new Hono();

router.get("/get-usuario", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT DNI, correo, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenPro, foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario",
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json(rows));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.get("/get-usuario-en", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT DNI, correo, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenProEN as 'resumenPro', foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario",
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json(rows));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.get("/get-usuario/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT DNI, correo, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenPro, foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario WHERE DNI = ?",
      [c.req.param("id")],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json(rows));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.get("/get-usuario-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT DNI, correo, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenProEN as 'resumenPro', foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo FROM usuario WHERE DNI = ?",
      [c.req.param("id")],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json(rows));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.get("/get-usuario-name", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT DNI, nombre, apellidoPaterno, apellidoMaterno, foto from usuario",
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json(rows));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.get("/get-usuario-full/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT DNI, correo, password, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenPro, resumenProEN, foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo, genero_idGenero FROM usuario WHERE DNI = ?",
      [c.req.param("id")],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json(rows));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.post("/search-usuarios", async (c) => {
  let usuario = await c.req.json();
  usuario.nombre = "%" + usuario.nombre + "%";
  var sql =
    "SELECT DNI, correo, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenPro, foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario WHERE nombre LIKE ? OR apellidoPaterno LIKE ? OR apellidoMaterno LIKE ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [usuario.nombre, usuario.nombre, usuario.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/search-usuarios-global", async (c) => {
  let usuario = await c.req.json();
  usuario.nombre = "%" + usuario.nombre + "%";
  var sql =
    "SELECT DNI, correo, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenPro, foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario WHERE nombre LIKE ? OR apellidoPaterno LIKE ? OR apellidoMaterno LIKE ? OR correo LIKE ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [usuario.nombre, usuario.nombre, usuario.nombre, usuario.nombre],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json(rows));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.post("/post-usuario", checkToken, async (c) => {
  let user = await c.req.json();
  user.password = bcrypt.hashSync(user.password, 10);
  var sql =
    "INSERT INTO usuario (DNI, correo, password, nombre, apellidoPaterno, apellidoMaterno, resumenPro, resumenProEN, fechaNacimiento, estado, restablecer, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo, genero_idGenero) VALUES(?,?,?,?,?,?,?,?,?,?,0,?,?,?,?);";
  return new Promise((resolve) => {
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
          resolve(c.json({ user: user.DNI, message: "El usuario ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-usuario/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE FROM usuario WHERE DNI = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1 }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-usuario", checkToken, async (c) => {
  let user = await c.req.json();
  var sql =
    "UPDATE usuario SET correo=?, nombre=?, apellidoPaterno=?, apellidoMaterno=?, resumenPro=?, resumenProEN=?, fechaNacimiento=?, estado=?, tipoUsuario_idTipoUsuario=?, tipoMiembro_idTipoMiembro=?, prefijo_idPrefijo=?, genero_idGenero=? WHERE DNI=?;";
  return new Promise((resolve) => {
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
          resolve(c.json({ status: 1, user: user.DNI, message: "El usuario ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/upload-usuario-file/:id", checkToken, async (c) => {
  const body = await c.req.parseBody({ all: true });
  const sql = "UPDATE usuario SET foto=? WHERE DNI=" + c.req.param("id") + ";";

  const files = [];
  for (const value of Object.values(body)) {
    if (value instanceof File) files.push(value);
    else if (Array.isArray(value)) files.push(...value.filter((v) => v instanceof File));
  }

  if (files.length > 0) {
    const file = files[0];
    const imageName = file.name;
    const file_ext = path.extname(file.name).slice(1).toLowerCase();
    if (file_ext == "png" || file_ext == "jpg" || file_ext == "jpeg") {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync("./uploads/usuario/" + file.name, buffer);
      return new Promise((resolve) => {
        mysqlConnection.query(sql, [imageName], (err, rows) => {
          if (!err) {
            resolve(c.json(rows));
          } else {
            console.log(err);
            resolve(c.json({ error: "Database error" }, 500));
          }
        });
      });
    } else {
      return c.json({ message: "Extensión del archivo no válida" });
    }
  } else {
    return c.json({ message: "No has subido ninguna imagen" });
  }
});

router.get("/get-image-usuario/:imageFile", async (c) => {
  const imageFile = c.req.param("imageFile");
  const path_file = "./uploads/usuario/" + imageFile;
  if (fs.existsSync(path_file)) {
    const data = await fs.promises.readFile(path_file);
    const ext = path.extname(imageFile).slice(1).toLowerCase();
    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      svg: "image/svg+xml",
      pdf: "application/pdf",
    };
    return c.body(data, 200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
  } else {
    return c.json({ message: "no existe la imagen" });
  }
});

//Login user
router.post("/login", async (c) => {
  let usuario = await c.req.json();
  var sql =
    "SELECT DNI, correo, password, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, resumenPro, foto, estado, tipoUsuario_idTipoUsuario, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario WHERE correo = ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [usuario.correo], (err, rows) => {
      if (!err && rows[0]) {
        if (bcrypt.compareSync(usuario.password, rows[0].password)) {
          rows[0].password = undefined;
          const { correo, password } = usuario;
          const user = {
            correo: correo,
            role: "admin",
          };
          const token = jwt.sign(user, SECRET, { expiresIn: 300 });
          const refreshToken = randtoken.uid(256);
          refreshTokens[refreshToken] = correo;
          resolve(c.json({ jwt: token, user: rows[0], refreshToken: refreshToken, state: 1 }));
        } else {
          resolve(c.json({ message: "Contraseña incorrecta ", state: 2 }));
        }
      } else {
        resolve(c.json({ message: "Correo no encontrado", state: 0 }));
      }
    });
  });
});

router.post("/logout", async (c) => {
  const { refreshToken } = await c.req.json();
  if (refreshToken in refreshTokens) {
    delete refreshTokens[refreshToken];
  }
  return new Response(null, { status: 204 });
});

router.post("/refresh", async (c) => {
  const { refreshToken } = await c.req.json();
  if (refreshToken in refreshTokens) {
    const user = {
      username: refreshTokens[refreshToken],
      role: "admin",
    };
    const token = jwt.sign(user, SECRET, { expiresIn: 300 });
    return c.json({ jwt: token });
  } else {
    return c.json({ message: "Unauthorized" }, 401);
  }
});

router.put("/update-password", checkToken, async (c) => {
  let user = await c.req.json();
  user.password = bcrypt.hashSync(user.password, 10);
  var sql = "UPDATE usuario SET password=?, restablecer=0 WHERE correo=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [user.password, user.correo], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ message: "La contraseña ha sido actualizada", state: 1 }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/check-res/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT restablecer from usuario WHERE correo = ?",
      [c.req.param("id")],
      (err, rows, fields) => {
        if (!err && rows[0]) {
          resolve(c.json({ state: rows[0].restablecer }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.get("/get-usuario-active/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT DNI, nombre, apellidoPaterno, apellidoMaterno, correo, foto, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario WHERE estado=?",
      [c.req.param("id")],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json(rows));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.get("/get-usuario-verify/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT DNI, nombre, apellidoPaterno, apellidoMaterno, correo, foto, tipoMiembro_idTipoMiembro, prefijo_idPrefijo from usuario WHERE tipoMiembro_idTipoMiembro=?",
      [c.req.param("id")],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json(rows));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.post("/verify-email", checkToken, async (c) => {
  let user = await c.req.json();
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT DNI from usuario WHERE correo=?", [user.correo], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/verify-DNI", checkToken, async (c) => {
  let user = await c.req.json();
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT DNI from usuario WHERE DNI=?", [user.DNI], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

const DIR = "uploads/usuario";

router.delete("/erase-image/:id", checkToken, (c) => {
  try {
    fs.unlinkSync(DIR + "/" + c.req.param("id"));
    return c.json({ message: "Successfully! Image has been Deleted", status: 1 });
  } catch (err) {
    // handle the error
    return c.json(err, 400);
  }
});

module.exports = router;
