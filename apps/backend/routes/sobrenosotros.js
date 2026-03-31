const { Hono } = require("hono");
const mysqlConnection = require("./../connection");
const { checkToken } = require("../auth/token_validation");

var fs = require("fs");
var path = require("path");

const router = new Hono();

router.get("/get-sobrenosotros", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from sobrenosotros", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-sobrenosotros-en", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idSobreNosotros, quienesSomosResumenEN as 'quienesSomosResumen', quienesSomosEN as 'quienesSomos', objetivosEN as 'objetivos', serviciosEN as 'servicios' from sobrenosotros",
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

router.put("/update-descripciongrupo", async (c) => {
  let sobrenosotros = await c.req.json();
  var sql = "UPDATE sobrenosotros SET quienesSomos=?, quienesSomosEN=? WHERE idSobreNosotros=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [sobrenosotros.quienesSomos, sobrenosotros.quienesSomosEN, sobrenosotros.idSobreNosotros],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "Ha sido actualizado" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/update-objetivosgrupo", checkToken, async (c) => {
  let sobrenosotros = await c.req.json();
  var sql = "UPDATE sobrenosotros SET objetivos=?, objetivosEN=? WHERE  idSobreNosotros=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [sobrenosotros.objetivos, sobrenosotros.objetivosEN, sobrenosotros.idSobreNosotros],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "Ha sido actualizado" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/update-serviciosgrupo", checkToken, async (c) => {
  let sobrenosotros = await c.req.json();
  var sql = "UPDATE sobrenosotros SET servicios=?, serviciosEN=? WHERE  idSobreNosotros=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [sobrenosotros.servicios, sobrenosotros.serviciosEN, sobrenosotros.idSobreNosotros],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "Ha sido actualizado" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/upload-sobrenosotros-foto/:id", checkToken, async (c) => {
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
    var sql = "UPDATE sobrenosotros SET foto=? WHERE idSobreNosotros=" + c.req.param("id") + ";";
    if (file_ext == "png" || file_ext == "jpg" || file_ext == "jpeg") {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync("./uploads/sobrenosotros/" + file.name, buffer);
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

router.get("/get-image-sobrenosotros/:imageFile", async (c) => {
  const imageFile = c.req.param("imageFile");
  const path_file = "./uploads/sobrenosotros/" + imageFile;
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
