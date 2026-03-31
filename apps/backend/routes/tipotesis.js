const express = require("express");
const mysqlConnection = require("../connection");

const Router = express.Router();

Router.get("/get-tipotesis", (req, res) =>{
    mysqlConnection.query("SELECT * from tipotesis", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-tipotesis-en", (req, res) =>{
    mysqlConnection.query("SELECT idTipoTesis, nombreEN as 'nombre' from tipotesis", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-tipotesis/:id", (req, res) =>{
    mysqlConnection.query("SELECT * FROM tipotesis WHERE idTipoTesis = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-tipotesis-en/:id", (req, res) =>{
    mysqlConnection.query("SELECT idTipoTesis, nombreEN as 'nombre' FROM tipotesis WHERE idTipoTesis = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-tipotesis", (req, res) =>{
    let tipotesis = req.body;
    tipotesis.nombre='%'+tipotesis.nombre+'%'
    var sql = "SELECT * from tipotesis WHERE nombre LIKE ?;"
    mysqlConnection.query(sql, [tipotesis.nombre],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-tipotesis-en", (req, res) =>{
    let tipotesis = req.body;
    tipotesis.nombre='%'+tipotesis.nombre+'%'
    var sql = "SELECT idTipoTesis, nombreEN as 'nombre' from tipotesis WHERE nombreEN LIKE ?;"
    mysqlConnection.query(sql, [tipotesis.nombre],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})


Router.post("/post-tipotesis", (req, res) =>{
    let tipotesis = req.body;
    var sql = "INSERT INTO tipotesis (nombre, fechaActualizacion, fechaCreacion) VALUES(?,?,?);";
    mysqlConnection.query(sql, [tipotesis.nombre, tipotesis.fechaCreacion, tipotesis.fechaActualizacion], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El tipotesis ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-tipotesis/:id", (req, res) =>{
    mysqlConnection.query("DELETE tipotesis WHERE idTipoPublicacion = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            rows.forEach(element => {
                if(element.constructor == Array){
                    res.send("Insertado id: "+element[0].idtipotesis);
                }
            });
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-tipotesis", (req, res) =>{
    let tipotesis = req.body;
    var sql = "UPDATE tipotesis SET nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idTipoPublicacion=?;"
    mysqlConnection.query(sql, [tipotesis.idTipoPublicacion, tipotesis.nombre, tipotesis.fechaCreacion, tipotesis.fechaActualizacion], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El tipotesis ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

module.exports = Router;