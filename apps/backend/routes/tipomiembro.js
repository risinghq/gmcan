const express = require("express");
const mysqlConnection = require("../connection");

const Router = express.Router();

Router.get("/get-tipomiembro", (req, res) =>{
    mysqlConnection.query("SELECT * from tipomiembro", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-tipomiembro-en", (req, res) =>{
    mysqlConnection.query("SELECT idTipoMiembro, nombreEN as 'nombre', nombreSingularEN as 'nombreSingular' from tipomiembro", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/post-tipomiembro", (req, res) =>{
    let tipomiembro = req.body;
    var sql = "INSERT INTO tipomiembro (idTipoMiembro, nombre, fechaCreacion, fechaActualizacion) VALUES(?,?,?,?);";
    mysqlConnection.query(sql, [tipomiembro.idTipoMiembro, tipomiembro.nombre, tipomiembro.fechaCreacion, tipomiembro.fechaActualizacion], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El tipomiembro ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-tipomiembro/:id", (req, res) =>{
    mysqlConnection.query("DELETE tipomiembro WHERE idTipoMiembro = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            rows.forEach(element => {
                if(element.constructor == Array){
                    res.send("Insertado id: "+element[0].idtipomiembro);
                }
            });
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-tipomiembro", (req, res) =>{
    let tipomiembro = req.body;
    var sql = "UPDATE tipomiembro SET idTipoMiembro=?, nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idTipoMiembro=?;"
    mysqlConnection.query(sql, [tipomiembro.idtipomiembro, tipomiembro.idTipoMiembro, tipomiembro.nombre, tipomiembro.fechaCreacion, tipomiembro.fechaActualizacion], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El tipomiembro ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

module.exports = Router;

//INSERT INTO `tesis`.`tipomiembro` (`idTipoMiembro`, `nombre`, `fechaCreacion`, `fechaActualizacion`) VALUES ('1', 'Administrador', '2020-01-15', '2020-01-15');