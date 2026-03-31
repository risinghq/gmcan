const { Hono } = require("hono");
const mysqlConnection = require("../connection");

const router = new Hono();
var fs = require("fs");
var path = require("path");

router.get("/get-publicacion", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from publicacion", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-publicacion-en", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion",
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

router.get("/get-publicacion/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * from publicacion WHERE idPublicacion=?",
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

router.get("/get-publicacion-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion WHERE idPublicacion=?",
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

router.get("/get-publicaciones/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * from publicacion WHERE tipoPublicacion_idTipoPublicacion=?",
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

router.get("/get-publicaciones-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion WHERE tipoPublicacion_idTipoPublicacion=?",
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

router.get("/get-publicacionesciudad/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from publicacion WHER = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-publicacionesciudad-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion WHER=?",
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

router.get("/get-publicacionesevento/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * from publicacion WHERE evento_idEvento = ?",
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

router.get("/get-publicacionesevento-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion WHERE evento_idEvento=?",
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

router.get("/get-publicacionesuniversidad/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * from publicacion WHERE universidad_idUniversidad = ?",
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

router.get("/get-publicacionesuniversidad-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion WHERE universidad_idUniversidad=?",
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

router.get("/get-publicacionesrevista/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * from publicacion WHERE revista_idRevista = ?",
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

router.get("/get-publicacionesrevista-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion WHERE revista_idRevista=?",
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

router.post("/search-publicaciones", async (c) => {
  let publicacion = await c.req.json();
  publicacion.titulo = "%" + publicacion.titulo + "%";
  var sql = "SELECT * from publicacion WHERE titulo LIKE ? AND tipoPublicacion_idTipoPublicacion=?";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [publicacion.titulo, publicacion.tipoPublicacion_idTipoPublicacion],
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

router.post("/search-publicaciones-global", async (c) => {
  let publicacion = await c.req.json();
  publicacion.titulo = "%" + publicacion.titulo + "%";
  var sql = "SELECT * from publicacion WHERE titulo LIKE ? OR fechaPublicacion LIKE ? OR resumen LIKE ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [publicacion.titulo, publicacion.titulo, publicacion.titulo], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/search-publicaciones-global-en", async (c) => {
  let publicacion = await c.req.json();
  publicacion.titulo = "%" + publicacion.titulo + "%";
  var sql =
    "SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion WHERE titulo LIKE ? OR fechaPublicacion LIKE ? OR resumenEN LIKE ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [publicacion.titulo, publicacion.titulo, publicacion.titulo], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-publicacion", async (c) => {
  let publicacion = await c.req.json();
  var sql =
    "INSERT INTO publicacion (titulo,resumen,resumenEN,DOI,fechaPublicacion, nroRevista, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, tipoTesis_idTipoTesis, evento_idEvento) VALUES(?,?,?,?,?,?,?,?,?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        publicacion.titulo,
        publicacion.resumen,
        publicacion.resumenEN,
        publicacion.DOI,
        publicacion.fechaPublicacion,
        publicacion.nroRevista,
        publicacion.tipoPublicacion_idTipoPublicacion,
        publicacion.revista_idRevista,
        publicacion.universidad_idUniversidad,
        publicacion.tipoTesis_idTipoTesis,
        publicacion.evento_idEvento,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(
            c.json({
              status: 1,
              idPublicacion: rows.insertId,
              message: "La publicacion ha sido guardada",
            }),
          );
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-publicacion/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "DELETE FROM publicacion WHERE idPublicacion = ?",
      [c.req.param("id")],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1 }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/update-publicacion", async (c) => {
  let publicacion = await c.req.json();
  var sql =
    "UPDATE publicacion SET titulo=?, resumen=?, resumenEN=?, DOI=?, fechaPublicacion=?, nroRevista=? ,tipoPublicacion_idTipoPublicacion=?, revista_idRevista=?, universidad_idUniversidad=? , tipoTesis_idTipoTesis=?, evento_idEvento=? WHERE  idPublicacion=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        publicacion.titulo,
        publicacion.resumen,
        publicacion.resumenEN,
        publicacion.DOI,
        publicacion.fechaPublicacion,
        publicacion.nroRevista,
        publicacion.tipoPublicacion_idTipoPublicacion,
        publicacion.revista_idRevista,
        publicacion.universidad_idUniversidad,
        publicacion.tipoTesis_idTipoTesis,
        publicacion.evento_idEvento,
        publicacion.idPublicacion,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "La publicacion ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/upload-publicacion-file/:id", async (c) => {
  const body = await c.req.parseBody({ all: true });
  const sql = "UPDATE publicacion SET archivo=? WHERE idPublicacion=" + c.req.param("id") + ";";

  const files = [];
  for (const value of Object.values(body)) {
    if (value instanceof File) files.push(value);
    else if (Array.isArray(value)) files.push(...value.filter((v) => v instanceof File));
  }

  if (files.length > 0) {
    const file = files[0];
    const archivoName = file.name;
    const file_ext = path.extname(file.name).slice(1).toLowerCase();
    if (file_ext == "pdf") {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync("./uploads/publicaciones/" + file.name, buffer);
      return new Promise((resolve) => {
        mysqlConnection.query(sql, [archivoName], (err, rows) => {
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

router.get("/download-publicacion/:pdfFile", async (c) => {
  const pdfFile = c.req.param("pdfFile");
  const path_file = "./uploads/publicaciones/" + pdfFile;
  if (fs.existsSync(path_file)) {
    const data = await fs.promises.readFile(path_file);
    return c.body(data, 200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdfFile}"`,
    });
  } else {
    return c.json({ message: "no existe el archivo" });
  }
});

router.get("/get-file-publicacion/:pdfFile", async (c) => {
  const pdfFile = c.req.param("pdfFile");
  const path_file = "./uploads/publicaciones/" + pdfFile;
  if (fs.existsSync(path_file)) {
    const data = await fs.promises.readFile(path_file);
    return c.body(data, 200, { "Content-Type": "application/pdf" });
  } else {
    return c.json({ message: "no existe la imagen" });
  }
});

module.exports = router;
