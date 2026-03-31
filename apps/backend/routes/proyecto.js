const { Hono } = require("hono");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const router = new Hono();

router.get("/get-proyecto", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * from proyecto", (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-proyecto-en", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idProyecto, tituloEN as 'titulo', codigo, montoFinanciado, montoFinanciado, descripcionEN as 'descripcion', estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento from proyecto",
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

router.get("/get-proyecto/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * FROM proyecto WHERE idProyecto = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-proyecto-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idProyecto, tituloEN as 'titulo', codigo, montoFinanciado, montoFinanciado, descripcionEN as 'descripcion', estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento FROM proyecto WHERE idProyecto = ?",
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

router.get("/get-proyectos/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("SELECT * FROM proyecto WHERE estado = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.get("/get-proyectos-en/:id", (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query(
      "SELECT idProyecto, tituloEN as 'titulo', codigo, montoFinanciado, montoFinanciado, descripcionEN as 'descripcion', estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento FROM proyecto WHERE estado = ?",
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

router.post("/search-proyecto", async (c) => {
  let proyecto = await c.req.json();
  proyecto.nombre = "%" + proyecto.nombre + "%";
  proyecto.codigo = "%" + proyecto.nombre + "%";
  var sql = "SELECT * from proyecto WHERE titulo LIKE ? OR codigo LIKE ? AND estado = ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [proyecto.nombre, proyecto.codigo, proyecto.estado], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/search-proyecto-en", async (c) => {
  let proyecto = await c.req.json();
  proyecto.nombre = "%" + proyecto.nombre + "%";
  proyecto.codigo = "%" + proyecto.nombre + "%";
  var sql =
    "SELECT idProyecto, tituloEN as 'titulo', codigo, montoFinanciado, descripcionEN as 'descripcion', estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento from proyecto WHERE tituloEN LIKE ? OR codigo LIKE ? AND estado = ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [proyecto.nombre, proyecto.codigo, proyecto.estado], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/search-proyecto-global", async (c) => {
  let proyecto = await c.req.json();
  proyecto.nombre = "%" + proyecto.nombre + "%";
  var sql = "SELECT * from proyecto WHERE titulo LIKE ? OR codigo LIKE ? OR descripcion LIKE ? AND estado = 1;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [proyecto.nombre, proyecto.nombre, proyecto.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/search-proyecto-global-en", async (c) => {
  let proyecto = await c.req.json();
  proyecto.nombre = "%" + proyecto.nombre + "%";
  var sql =
    "SELECT idProyecto, tituloEN as 'titulo', codigo, montoFinanciado, descripcionEN as 'descripcion', estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento from proyecto WHERE tituloEN LIKE ? OR codigo LIKE ? OR descripcion LIKE ? AND estado = 1;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [proyecto.nombre, proyecto.nombre, proyecto.nombre], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/get-proyectolinea", async (c) => {
  let proyecto = await c.req.json();
  var sql = "SELECT * from proyecto WHERE lineasInvestigacion_idLineasInvestigacion = ? AND estado = ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [proyecto.lineasInvestigacion_idLineasInvestigacion, proyecto.estado],
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

router.post("/get-proyectolinea-en", async (c) => {
  let proyecto = await c.req.json();
  var sql =
    "SELECT idProyecto, tituloEN as 'titulo', codigo, montoFinanciado, descripcionEN as 'descripcion', estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento from proyecto WHERE lineasInvestigacion_idLineasInvestigacion = ? AND estado = ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [proyecto.lineasInvestigacion_idLineasInvestigacion, proyecto.estado],
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

router.get("/get-proyectofuente/:id", (c) => {
  var sql = "SELECT * from proyecto WHERE fuenteFinanciamiento_idFuenteFinanciamiento = ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/get-proyectoid", async (c) => {
  let proyecto = await c.req.json();
  var sql = "SELECT * from proyecto WHERE idProyecto = ? AND estado = ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [proyecto.idProyecto, proyecto.estado], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/get-proyectoid-en", async (c) => {
  let proyecto = await c.req.json();
  var sql =
    "SELECT idProyecto, tituloEN as 'titulo', codigo, montoFinanciado, descripcionEN as 'descripcion', estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento from proyecto WHERE idProyecto = ? AND estado = ?;";
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [proyecto.idProyecto, proyecto.estado], (err, rows, fields) => {
      if (!err) {
        resolve(c.json(rows));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.post("/post-proyecto", checkToken, async (c) => {
  let proyecto = await c.req.json();
  var sql =
    "INSERT INTO proyecto (titulo, tituloEN, codigo, montoFinanciado, descripcion, descripcionEN, estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento) VALUES(?,?,?,?,?,?,?,?,?,?,?);";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        proyecto.titulo,
        proyecto.tituloEN,
        proyecto.codigo,
        proyecto.montoFinanciado,
        proyecto.descripcion,
        proyecto.descripcionEN,
        proyecto.estado,
        proyecto.fechaI,
        proyecto.fechaF,
        proyecto.lineasInvestigacion_idLineasInvestigacion,
        proyecto.moneda_idMoneda,
        proyecto.fuenteFinanciamiento_idFuenteFinanciamiento,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, idProyecto: rows.insertId, message: "El proyecto ha sido guardada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.delete("/delete-proyecto/:id", checkToken, (c) => {
  return new Promise((resolve) => {
    mysqlConnection.query("DELETE FROM proyecto WHERE idProyecto = ?", [c.req.param("id")], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "El publicacion_has_usuario ha sido actualizada" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/update-proyecto", checkToken, async (c) => {
  let proyecto = await c.req.json();
  var sql =
    "UPDATE proyecto SET titulo=?, tituloEN=?, codigo=?, montoFinanciado=?, descripcion=?, descripcionEN=?, estado=?, fechaInicio=?, fechaFin=?, lineasInvestigacion_idLineasInvestigacion=?, moneda_idMoneda=?, fuenteFinanciamiento_idFuenteFinanciamiento=? WHERE idProyecto=?;";
  return new Promise((resolve) => {
    mysqlConnection.query(
      sql,
      [
        proyecto.titulo,
        proyecto.tituloEN,
        proyecto.codigo,
        proyecto.montoFinanciado,
        proyecto.descripcion,
        proyecto.descripcionEN,
        proyecto.estado,
        proyecto.fechaI,
        proyecto.fechaF,
        proyecto.lineasInvestigacion_idLineasInvestigacion,
        proyecto.moneda_idMoneda,
        proyecto.fuenteFinanciamiento_idFuenteFinanciamiento,
        proyecto.idProyecto,
      ],
      (err, rows, fields) => {
        if (!err) {
          resolve(c.json({ status: 1, message: "El proyecto ha sido actualizada" }));
        } else {
          console.log(err);
          resolve(c.json({ error: "Database error" }, 500));
        }
      },
    );
  });
});

router.put("/end-proyecto", checkToken, async (c) => {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }

  if (mm < 10) {
    mm = "0" + mm;
  }
  today = yyyy + "-" + mm + "-" + dd;
  let proyecto = await c.req.json();
  var sql = "UPDATE proyecto SET fechaFin=?, estado=? WHERE idProyecto=?;";
  proyecto.fechaF = today;
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [proyecto.fechaF, proyecto.estado, proyecto.idProyecto], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "El proyecto ha sido concluido" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

router.put("/restart-proyecto", checkToken, async (c) => {
  let proyecto = await c.req.json();
  var sql = "UPDATE proyecto SET fechaFin=?, estado=? WHERE idProyecto=?;";
  proyecto.fechaF = null;
  return new Promise((resolve) => {
    mysqlConnection.query(sql, [proyecto.fechaF, proyecto.estado, proyecto.idProyecto], (err, rows, fields) => {
      if (!err) {
        resolve(c.json({ status: 1, message: "El proyecto ha sido concluido" }));
      } else {
        console.log(err);
        resolve(c.json({ error: "Database error" }, 500));
      }
    });
  });
});

module.exports = router;
