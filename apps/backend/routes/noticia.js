const { Hono } = require("hono");
const mysqlConnection = require("../connection");

const router = new Hono();
const { checkToken } = require("../auth/token_validation");

var fs = require("fs");
var path = require("path");

router.get("/get-noticia", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from noticia", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-noticia-en", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idNoticia, tituloEN as 'titulo', resumenEN as 'resumen', cuerpoEN as 'cuerpo', estado, fechaPublicacion, fechaActualizacion, foto, prioridad, autorPublicacion, tipoNoticia_idtipoNoticia  from noticia",
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

router.get("/get-noticia/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * FROM noticia WHERE idNoticia = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-noticia-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idNoticia, tituloEN as 'titulo', resumenEN as 'resumen', cuerpoEN as 'cuerpo', estado, fechaPublicacion, fechaActualizacion, foto, prioridad, autorPublicacion, tipoNoticia_idtipoNoticia from noticia WHERE idNoticia = ?",
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

router.get("/get-noticiausuario/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * FROM noticia WHERE autorPublicacion = ?",
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

router.get("/get-noticiausuario-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idNoticia, tituloEN as 'titulo', resumenEN as 'resumen', cuerpoEN as 'cuerpo', estado, fechaPublicacion, fechaActualizacion, foto, prioridad, autorPublicacion, tipoNoticia_idtipoNoticia from noticia WHERE autorPublicacion = ?",
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

router.get("/get-noticiatipo/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * FROM noticia WHERE tipoNoticia_idtipoNoticia = ?",
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

router.get("/get-noticiatipo-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idNoticia, tituloEN as 'titulo', resumenEN as 'resumen', cuerpoEN as 'cuerpo', estado, fechaPublicacion, fechaActualizacion, foto, prioridad, autorPublicacion, tipoNoticia_idtipoNoticia from noticia WHERE tipoNoticia_idtipoNoticia = ?",
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

router.get("/get-noticiafull/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from noticia WHERE idNoticia = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows[0]));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/search-noticia-global", async (c) => {
  let noticia = await c.req.json();
  noticia.titulo = "%" + noticia.nombre + "%";
  noticia.codigo = "%" + noticia.nombre + "%";
  noticia.resumen = "%" + noticia.nombre + "%";
  noticia.fechaPublicacion = "%" + noticia.nombre + "%";
  var sql = "SELECT * from noticia WHERE titulo LIKE ? OR cuerpo LIKE ? OR resumen LIKE ? OR fechaPublicacion LIKE ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [noticia.titulo, noticia.cuerpo, noticia.resumen, noticia.fechaPublicacion],
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

router.post("/search-noticia-global-en", async (c) => {
  let noticia = await c.req.json();
  noticia.titulo = "%" + noticia.nombre + "%";
  noticia.codigo = "%" + noticia.nombre + "%";
  noticia.resumen = "%" + noticia.nombre + "%";
  noticia.fechaPublicacion = "%" + noticia.nombre + "%";
  var sql =
    "SELECT * from noticia WHERE tituloEN LIKE ? OR cuerpoEN LIKE ? OR resumenEN LIKE ? OR fechaPublicacion LIKE ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [noticia.titulo, noticia.cuerpo, noticia.resumen, noticia.fechaPublicacion],
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

router.post("/post-noticia", checkToken, async (c) => {
  let not = await c.req.json();
  var sql =
    "INSERT INTO noticia (titulo, tituloEN, resumen,resumenEN,cuerpo,cuerpoEN,estado, fechaPublicacion,autorPublicacion, tipoNoticia_idtipoNoticia) VALUES(?,?,?,?,?,?,?,?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        not.titulo,
        not.tituloEN,
        not.resumen,
        not.resumenEN,
        not.cuerpo,
        not.cuerpoEN,
        not.estado,
        not.fechaPublicacion,
        not.autorPublicacion,
        not.tipoNoticia_idtipoNoticia,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ rows: rows.insertId, status: 1, message: "La noticia ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-noticia/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE FROM noticia WHERE idNoticia = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "Eliminada la noticia" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-noticia", async (c) => {
  let not = await c.req.json();
  var sql =
    "UPDATE noticia SET titulo=?, tituloEN=?, resumen=?, resumenEN=?, cuerpo=?, cuerpoEN=?, fechaPublicacion=?, estado=?, autorPublicacion=?, tipoNoticia_idtipoNoticia=? WHERE  idNoticia=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        not.titulo,
        not.tituloEN,
        not.resumen,
        not.resumenEN,
        not.cuerpo,
        not.cuerpoEN,
        not.fechaPublicacion,
        not.estado,
        not.autorPublicacion,
        not.tipoNoticia_idtipoNoticia,
        not.idNoticia,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "La noticia ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/upload-noticia-file/:id", checkToken, async (c) => {
  const body = await c.req.parseBody({ all: true });

  const files = [];
  for (const value of Object.values(body)) {
    if (value instanceof File) files.push(value);
    else if (Array.isArray(value)) files.push(...value.filter((v) => v instanceof File));
  }

  if (files.length > 0) {
    const file = files[0];
    const fotoName = file.name;
    const file_ext = path.extname(file.name).slice(1).toLowerCase();
    var sql = "UPDATE noticia SET foto=? WHERE idNoticia=" + c.req.param("id") + ";";
    if (file_ext == "png" || file_ext == "jpg" || file_ext == "jpeg") {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync("./uploads/noticia/" + file.name, buffer);
      return new Promise((resolve) => {
        mysqlConnection.query(sql, [fotoName], (err, rows) => {
          if (!err) {
            resolve(c.json(rows));
          } else {
            console.log(sql);
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

router.get("/get-image-noticia/:imageFile", async (c) => {
  const imageFile = c.req.param("imageFile");
  const path_file = "./uploads/noticia/" + imageFile;
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

module.exports = router;
