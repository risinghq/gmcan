const { Hono } = require("hono");
const mysqlConnection = require("../connection");

const { checkToken } = require("../auth/token_validation");
var fs = require("fs");
var path = require("path");

const router = new Hono();

router.get("/get-metodo", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from metodo", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-metodo-en", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idMetodo, nombreEN as 'nombre', descripcionEN as 'descripcion', foto, fechaActualizacion, grupo_idGrupo from metodo",
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

router.get("/get-metodo/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * FROM metodo WHERE idMetodo = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-metodo-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idMetodo, nombreEN as 'nombre', descripcionEN as 'descripcion', foto, fechaActualizacion, grupo_idGrupo from metodo WHERE idMetodo = ?",
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

router.post("/post-metodo", checkToken, async (c) => {
  let not = await c.req.json();
  var sql = "INSERT INTO metodo (nombre,nombreEN,descripcion,descripcionEN, grupo_idGrupo) VALUES(?,?,?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [not.nombre, not.nombreEN, not.descripcion, not.descripcionEN, not.grupo_idGrupo],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, idMetodo: rows.insertId, message: "El método ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-metodo/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE FROM metodo WHERE idMetodo = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "El método ha sido eliminado" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-metodo", checkToken, async (c) => {
  let not = await c.req.json();
  var sql =
    "UPDATE metodo SET nombre=?, nombreEN=?, descripcion=?, descripcionEN=?, grupo_idGrupo=? WHERE  idMetodo=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [not.nombre, not.nombreEN, not.descripcion, not.descripcionEN, not.grupo_idGrupo, not.idMetodo],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "La metodo ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/upload-metodo-foto/:id", checkToken, async (c) => {
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
    var sql = "UPDATE metodo SET foto=? WHERE idMetodo=" + c.req.param("id") + ";";
    if (file_ext == "png" || file_ext == "jpg" || file_ext == "jpeg") {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync("./uploads/metodos/" + file.name, buffer);
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

router.get("/get-image-metodo/:imageFile", async (c) => {
  const imageFile = c.req.param("imageFile");
  const path_file = "./uploads/metodos/" + imageFile;
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
