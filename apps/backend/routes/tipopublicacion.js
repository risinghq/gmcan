const express = require("express");
const mysqlConnection = require("../connection");

const Router = express.Router();

Router.get("/get-tipopublicacion", (req, res) =>{
    mysqlConnection.query("SELECT * from tipopublicacion", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-tipopublicacion-en", (req, res) =>{
    mysqlConnection.query("SELECT idTipoPublicacion, nombreEN as 'nombre' from tipopublicacion", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-tipopublicacion/:id", (req, res) =>{
    mysqlConnection.query("SELECT * FROM tipopublicacion WHERE idTipoPublicacion = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-tipopublicacion-en/:id", (req, res) =>{
    mysqlConnection.query("SELECT idTipoPublicacion, nombreEN as 'nombre' FROM tipopublicacion WHERE idTipoPublicacion = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-tipopublicacion", (req, res) =>{
    let revista = req.body;
    revista.nombre='%'+revista.nombre+'%'
    var sql = "SELECT * from revista WHERE nombre LIKE ?"
    mysqlConnection.query(sql, [revista.nombre],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-tipopublicacion-en", (req, res) =>{
    let revista = req.body;
    revista.nombre='%'+revista.nombre+'%'
    var sql = "SELECT idTipoPublicacion, nombreEN as 'nombre' from revista WHERE nombreEN LIKE ?"
    mysqlConnection.query(sql, [revista.nombre],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/post-tipopublicacion", (req, res) =>{
    let tipopublicacion = req.body;
    var sql = "INSERT INTO tipopublicacion (nombre, fechaActualizacion, fechaCreacion) VALUES(?,?,?);";
    mysqlConnection.query(sql, [tipopublicacion.nombre, tipopublicacion.fechaCreacion, tipopublicacion.fechaActualizacion], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El tipopublicacion ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-tipopublicacion/:id", (req, res) =>{
    mysqlConnection.query("DELETE tipopublicacion WHERE idTipoPublicacion = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            rows.forEach(element => {
                if(element.constructor == Array){
                    res.send("Insertado id: "+element[0].idtipopublicacion);
                }
            });
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-tipopublicacion", (req, res) =>{
    let tipopublicacion = req.body;
    var sql = "UPDATE tipopublicacion SET nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idTipoPublicacion=?;"
    mysqlConnection.query(sql, [tipopublicacion.idTipoPublicacion, tipopublicacion.nombre, tipopublicacion.fechaCreacion, tipopublicacion.fechaActualizacion], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El tipopublicacion ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

module.exports = Router;