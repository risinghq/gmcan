const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");
var fs = require("fs");
var path = require("path");

const router = new Hono();

router.get("/get-lineasinvestigacion", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from lineasinvestigacion", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-lineasinvestigacion-en", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idLineasInvestigacion, nombreEN as 'nombre', descripcionEN as 'descripcion' from lineasinvestigacion",
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

router.get("/get-lineasinvestigacion/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT * FROM lineasinvestigacion WHERE idLineasInvestigacion = ?",
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

router.get("/get-lineasinvestigacion-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idLineasInvestigacion, nombreEN as 'nombre', descripcionEN as 'descripcion' FROM lineasinvestigacion WHERE idLineasInvestigacion = ?",
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

router.post("/search-lineasinvestigacion", async (c) => {
  let lineasinvestigacion = await c.req.json();
  lineasinvestigacion.nombre = "%" + lineasinvestigacion.nombre + "%";
  var sql = "SELECT * from lineasinvestigacion WHERE nombre LIKE ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [lineasinvestigacion.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/search-lineasinvestigacion-en", async (c) => {
  let lineasinvestigacion = await c.req.json();
  lineasinvestigacion.nombre = "%" + lineasinvestigacion.nombre + "%";
  var sql =
    "SELECT idLineasInvestigacion, nombreEN as 'nombre',descripcionEN as 'descripcion', grupo_idGrupo from lineasinvestigacion WHERE nombreEN LIKE ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [lineasinvestigacion.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-lineasinvestigacion", checkToken, async (c) => {
  let lineasinvestigacion = await c.req.json();
  var sql =
    "INSERT INTO lineasinvestigacion (nombre, nombreEN, descripcion, descripcionEN, grupo_idGrupo) VALUES(?,?,?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        lineasinvestigacion.nombre,
        lineasinvestigacion.nombreEN,
        lineasinvestigacion.descripcion,
        lineasinvestigacion.descripcionEN,
        lineasinvestigacion.grupo_idGrupo,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(
            c.json({
              status: 1,
              idLineasInvestigacion: rows.insertId,
              message: "La línea ha sido guardada",
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

router.delete("/delete-lineasinvestigacion/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "DELETE FROM lineasinvestigacion WHERE idLineasInvestigacion = ?",
      [c.req.param("id")],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "Borrado exitosamente" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/update-lineasinvestigacion", checkToken, async (c) => {
  let lineasinvestigacion = await c.req.json();
  var sql =
    "UPDATE lineasinvestigacion SET nombre=?, nombreEN=?, descripcion=?, descripcionEN=?, grupo_idGrupo=? WHERE  idLineasInvestigacion=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        lineasinvestigacion.nombre,
        lineasinvestigacion.nombreEN,
        lineasinvestigacion.descripcion,
        lineasinvestigacion.descripcionEN,
        lineasinvestigacion.grupo_idGrupo,
        lineasinvestigacion.idLineasInvestigacion,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "El lineasinvestigacion ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/upload-lineainvestigacion-foto/:id", checkToken, async (c) => {
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
    var sql = "UPDATE lineasinvestigacion SET foto=? WHERE idLineasInvestigacion=" + c.req.param("id") + ";";
    if (file_ext == "png" || file_ext == "jpg" || file_ext == "jpeg") {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync("./uploads/lineainvestigacion/" + file.name, buffer);
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

router.get("/get-image-lineainvestigacion/:imageFile", async (c) => {
  const imageFile = c.req.param("imageFile");
  const path_file = "./uploads/lineainvestigacion/" + imageFile;
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
