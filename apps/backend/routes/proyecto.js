const express = require("express");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const Router = express.Router();

Router.get("/get-proyecto", (req, res) => {
  mysqlConnection.query("SELECT * from proyecto", (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.get("/get-proyecto-en", (req, res) => {
  mysqlConnection.query(
    "SELECT idProyecto, tituloEN as 'titulo', codigo, montoFinanciado, montoFinanciado, descripcionEN as 'descripcion', estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento from proyecto",
    (err, rows, fields) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    },
  );
});

Router.get("/get-proyecto/:id", (req, res) => {
  mysqlConnection.query("SELECT * FROM proyecto WHERE idProyecto = ?", [req.params.id], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.get("/get-proyecto-en/:id", (req, res) => {
  mysqlConnection.query(
    "SELECT idProyecto, tituloEN as 'titulo', codigo, montoFinanciado, montoFinanciado, descripcionEN as 'descripcion', estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento FROM proyecto WHERE idProyecto = ?",
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

Router.get("/get-proyectos/:id", (req, res) => {
  mysqlConnection.query("SELECT * FROM proyecto WHERE estado = ?", [req.params.id], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.get("/get-proyectos-en/:id", (req, res) => {
  mysqlConnection.query(
    "SELECT idProyecto, tituloEN as 'titulo', codigo, montoFinanciado, montoFinanciado, descripcionEN as 'descripcion', estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento FROM proyecto WHERE estado = ?",
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

Router.post("/search-proyecto", (req, res) => {
  let proyecto = req.body;
  proyecto.nombre = "%" + proyecto.nombre + "%";
  proyecto.codigo = "%" + proyecto.nombre + "%";
  var sql = "SELECT * from proyecto WHERE titulo LIKE ? OR codigo LIKE ? AND estado = ?;";
  mysqlConnection.query(sql, [proyecto.nombre, proyecto.codigo, proyecto.estado], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/search-proyecto-en", (req, res) => {
  let proyecto = req.body;
  proyecto.nombre = "%" + proyecto.nombre + "%";
  proyecto.codigo = "%" + proyecto.nombre + "%";
  var sql =
    "SELECT idProyecto, tituloEN as 'titulo', codigo, montoFinanciado, descripcionEN as 'descripcion', estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento from proyecto WHERE tituloEN LIKE ? OR codigo LIKE ? AND estado = ?;";
  mysqlConnection.query(sql, [proyecto.nombre, proyecto.codigo, proyecto.estado], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/search-proyecto-global", (req, res) => {
  let proyecto = req.body;
  proyecto.nombre = "%" + proyecto.nombre + "%";
  var sql = "SELECT * from proyecto WHERE titulo LIKE ? OR codigo LIKE ? OR descripcion LIKE ? AND estado = 1;";
  mysqlConnection.query(sql, [proyecto.nombre, proyecto.nombre, proyecto.nombre], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/search-proyecto-global-en", (req, res) => {
  let proyecto = req.body;
  proyecto.nombre = "%" + proyecto.nombre + "%";
  var sql =
    "SELECT idProyecto, tituloEN as 'titulo', codigo, montoFinanciado, descripcionEN as 'descripcion', estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento from proyecto WHERE tituloEN LIKE ? OR codigo LIKE ? OR descripcion LIKE ? AND estado = 1;";
  mysqlConnection.query(sql, [proyecto.nombre, proyecto.nombre, proyecto.nombre], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/get-proyectolinea", (req, res) => {
  let proyecto = req.body;
  var sql = "SELECT * from proyecto WHERE lineasInvestigacion_idLineasInvestigacion = ? AND estado = ?;";
  mysqlConnection.query(
    sql,
    [proyecto.lineasInvestigacion_idLineasInvestigacion, proyecto.estado],
    (err, rows, fields) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    },
  );
});

Router.post("/get-proyectolinea-en", (req, res) => {
  let proyecto = req.body;
  var sql =
    "SELECT idProyecto, tituloEN as 'titulo', codigo, montoFinanciado, descripcionEN as 'descripcion', estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento from proyecto WHERE lineasInvestigacion_idLineasInvestigacion = ? AND estado = ?;";
  mysqlConnection.query(
    sql,
    [proyecto.lineasInvestigacion_idLineasInvestigacion, proyecto.estado],
    (err, rows, fields) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    },
  );
});

Router.get("/get-proyectofuente/:id", (req, res) => {
  var sql = "SELECT * from proyecto WHERE fuenteFinanciamiento_idFuenteFinanciamiento = ?;";
  mysqlConnection.query(sql, [req.params.id], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/get-proyectoid", (req, res) => {
  let proyecto = req.body;
  var sql = "SELECT * from proyecto WHERE idProyecto = ? AND estado = ?;";
  mysqlConnection.query(sql, [proyecto.idProyecto, proyecto.estado], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/get-proyectoid-en", (req, res) => {
  let proyecto = req.body;
  var sql =
    "SELECT idProyecto, tituloEN as 'titulo', codigo, montoFinanciado, descripcionEN as 'descripcion', estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento from proyecto WHERE idProyecto = ? AND estado = ?;";
  mysqlConnection.query(sql, [proyecto.idProyecto, proyecto.estado], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

Router.post("/post-proyecto", checkToken, (req, res) => {
  let proyecto = req.body;
  var sql =
    "INSERT INTO proyecto (titulo, tituloEN, codigo, montoFinanciado, descripcion, descripcionEN, estado, fechaInicio, fechaFin, lineasInvestigacion_idLineasInvestigacion, moneda_idMoneda, fuenteFinanciamiento_idFuenteFinanciamiento) VALUES(?,?,?,?,?,?,?,?,?,?,?);";
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
        res.send({ status: 1, idProyecto: rows.insertId, message: "El proyecto ha sido guardada" });
      } else {
        console.log(err);
      }
    },
  );
});

Router.delete("/delete-proyecto/:id", checkToken, (req, res) => {
  mysqlConnection.query("DELETE FROM proyecto WHERE idProyecto = ?", [req.params.id], (err, rows, fields) => {
    if (!err) {
      res.send({ status: 1, message: "El publicacion_has_usuario ha sido actualizada" });
    } else {
      console.log(err);
    }
  });
});

Router.put("/update-proyecto", checkToken, (req, res) => {
  let proyecto = req.body;
  var sql =
    "UPDATE proyecto SET titulo=?, tituloEN=?, codigo=?, montoFinanciado=?, descripcion=?, descripcionEN=?, estado=?, fechaInicio=?, fechaFin=?, lineasInvestigacion_idLineasInvestigacion=?, moneda_idMoneda=?, fuenteFinanciamiento_idFuenteFinanciamiento=? WHERE idProyecto=?;";
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
        res.send({ status: 1, message: "El proyecto ha sido actualizada" });
      } else {
        console.log(err);
      }
    },
  );
});

Router.put("/end-proyecto", checkToken, (req, res) => {
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
  let proyecto = req.body;
  var sql = "UPDATE proyecto SET fechaFin=?, estado=? WHERE idProyecto=?;";
  proyecto.fechaF = today;
  mysqlConnection.query(sql, [proyecto.fechaF, proyecto.estado, proyecto.idProyecto], (err, rows, fields) => {
    if (!err) {
      res.send({ status: 1, message: "El proyecto ha sido concluido" });
    } else {
      console.log(err);
    }
  });
});

Router.put("/restart-proyecto", checkToken, (req, res) => {
  let proyecto = req.body;
  var sql = "UPDATE proyecto SET fechaFin=?, estado=? WHERE idProyecto=?;";
  proyecto.fechaF = null;
  mysqlConnection.query(sql, [proyecto.fechaF, proyecto.estado, proyecto.idProyecto], (err, rows, fields) => {
    if (!err) {
      res.send({ status: 1, message: "El proyecto ha sido concluido" });
    } else {
      console.log(err);
    }
  });
});

module.exports = Router;
