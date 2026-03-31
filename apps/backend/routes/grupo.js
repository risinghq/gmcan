const { Hono } = require("hono");
const mysqlConnection = require("./../connection");

const { checkToken } = require("../auth/token_validation");

var fs = require("fs");
var path = require("path");

const router = new Hono();

router.get("/get-grupo", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from grupo", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-grupo-en", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idGrupo, quienesSomosResumenEN as 'quienesSomosResumen', direccion, correo, nombreGrupo2, trabajosFuturosEN as 'trabajosFuturos', telefono ,logoHeader, logoFooter from grupo",
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

router.get("/get-grupo-facilidades", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT facilidadesRecursos, facilidadesRecursosEN, facilidadesRecursosFoto, idGrupo from grupo",
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

router.get("/get-grupo-trabajosfuturos", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT trabajosFuturos, trabajosFuturosEN, idGrupo from grupo", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-grupo-facilidades", checkToken, async (c) => {
  let grupo = await c.req.json();
  var sql = "UPDATE grupo SET facilidadesRecursos=?, facilidadesRecursosEN=? WHERE  idGrupo=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [grupo.facilidadesRecursos, grupo.facilidadesRecursosEN, grupo.idGrupo],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "El grupo ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/update-grupo-trabajosfuturos", checkToken, async (c) => {
  let grupo = await c.req.json();
  var sql = "UPDATE grupo SET trabajosFuturos=?, trabajosFuturosEN=? WHERE idGrupo=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [grupo.trabajosFuturos, grupo.trabajosFuturosEN, grupo.idGrupo], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "El grupo ha sido actualizado" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-grupo-info", checkToken, async (c) => {
  let grupo = await c.req.json();
  var sql = "UPDATE grupo SET correo=?, telefono=? WHERE idGrupo=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [grupo.correo, grupo.telefono, grupo.idGrupo], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "El grupo ha sido actualizado" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-grupo-seccionpresentacion", checkToken, async (c) => {
  let grupo = await c.req.json();
  var sql = "UPDATE grupo SET quienesSomosResumen=?, quienesSomosResumenEN=? WHERE idGrupo=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [grupo.quienesSomosResumen, grupo.quienesSomosResumenEN, grupo.idGrupo],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "El grupo ha sido actualizado" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/update-grupo-seccionpublicaciones", checkToken, async (c) => {
  let grupo = await c.req.json();
  var sql = "UPDATE grupo SET seccionPublicaciones=?, seccionPublicacionesEN=? WHERE idGrupo=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [grupo.seccionPublicaciones, grupo.seccionPublicacionesEN, grupo.idGrupo],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "El grupo ha sido actualizado" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/update-grupo-seccionproyectos", checkToken, async (c) => {
  let grupo = await c.req.json();
  var sql = "UPDATE grupo SET seccionProyectos=?, seccionProyectosEN=? WHERE idGrupo=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [grupo.seccionProyectos, grupo.seccionProyectosEN, grupo.idGrupo],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "El grupo ha sido actualizado" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/upload-image-facilidades/:id", checkToken, async (c) => {
  const body = await c.req.parseBody({ all: true });
  const sql = "UPDATE grupo SET facilidadesRecursosFoto=? WHERE idGrupo=" + c.req.param("id") + " ;";

  const files = [];
  for (const value of Object.values(body)) {
    if (value instanceof File) files.push(value);
    else if (Array.isArray(value)) files.push(...value.filter((v) => v instanceof File));
  }

  if (files.length > 0) {
    const file = files[0];
    const fotoName = file.name;
    const file_ext = path.extname(file.name).slice(1).toLowerCase();
    if (file_ext == "jpg" || file_ext == "png" || file_ext == "jpeg") {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync("./uploads/grupo/" + file.name, buffer);
      return new Promise((resolve) => {
        mysqlConnection.query(sql, [fotoName], (err, rows) => {
          if (!err) {
            resolve(c.json({ message: "La foto de facilidades ha sido actualizado" }));
          } else {
            console.log(err);
            resolve(c.json({ error: "Database error" }, 500));
          }
        });
      });
    } else {
      return c.json({ message: "Extensión del archivo no válida solo SVG" });
    }
  } else {
    return c.json({ message: "No has subido ninguna imagen" });
  }
});

router.put("/upload-grupo-header/:id", checkToken, async (c) => {
  const body = await c.req.parseBody({ all: true });
  const sql = "UPDATE grupo SET logoHeader=? WHERE  idGrupo=" + c.req.param("id") + ";";

  const files = [];
  for (const value of Object.values(body)) {
    if (value instanceof File) files.push(value);
    else if (Array.isArray(value)) files.push(...value.filter((v) => v instanceof File));
  }

  if (files.length > 0) {
    const file = files[0];
    const fotoName = file.name;
    const file_ext = path.extname(file.name).slice(1).toLowerCase();
    if (file_ext == "png" || file_ext == "svg") {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync("./uploads/grupo/" + file.name, buffer);
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

router.put("/upload-grupo-footer/:id", checkToken, async (c) => {
  const body = await c.req.parseBody({ all: true });
  const sql = "UPDATE grupo SET logoFooter=? WHERE  idGrupo=" + c.req.param("id") + ";";

  const files = [];
  for (const value of Object.values(body)) {
    if (value instanceof File) files.push(value);
    else if (Array.isArray(value)) files.push(...value.filter((v) => v instanceof File));
  }

  if (files.length > 0) {
    const file = files[0];
    const fotoName = file.name;
    const file_ext = path.extname(file.name).slice(1).toLowerCase();
    if (file_ext == "png" || file_ext == "svg") {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync("./uploads/grupo/" + file.name, buffer);
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

router.get("/get-image-grupo/:imageFile", async (c) => {
  const imageFile = c.req.param("imageFile");
  const path_file = "./uploads/grupo/" + imageFile;
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

router.get("/get-image-facilidades/:imageFile", async (c) => {
  const imageFile = c.req.param("imageFile");
  const path_file = "./uploads/grupo/" + imageFile;
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
