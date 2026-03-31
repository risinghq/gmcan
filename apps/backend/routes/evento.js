const express = require("express");
const mysqlConnection = require("../connection");

const Router = express.Router();

Router.get("/get-evento", (req, res) =>{
    mysqlConnection.query("SELECT * from evento", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-evento-en", (req, res) =>{
    mysqlConnection.query("SELECT idEvento, nombre, paisEN as 'pais', ciudadEN as 'ciudad' from evento", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-evento/:id", (req, res) =>{
    mysqlConnection.query("SELECT * FROM evento WHERE idEvento = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-evento-en/:id", (req, res) =>{
    mysqlConnection.query("SELECT idEvento, nombre, paisEN as 'pais', ciudadEN as 'ciudad' FROM evento WHERE idEvento = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-eventos", (req, res) =>{
    let evento = req.body;
    evento.nombre='%'+evento.nombre+'%'
    var sql = "SELECT * from evento WHERE nombre LIKE ?;"
    mysqlConnection.query(sql, [evento.nombre],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/post-evento", (req, res) =>{
    let evento = req.body;
    var sql = "INSERT INTO evento (nombre, ciudad, ciudadEN, pais, paisEN) VALUES(?,?,?,?,?);";
    mysqlConnection.query(sql, [evento.nombre, evento.ciudad, evento.ciudadEN, evento.pais, evento.paisEN], (err, rows, fields)=>{
        if(!err){
            res.send({status:1, message: 'La tipo noticia ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-evento/:id", (req, res) =>{
    mysqlConnection.query("DELETE FROM evento WHERE idEvento = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send({status: 1, message:"Eliminado tipo de noticia"});
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-evento", (req, res) =>{
    let evento = req.body;
    var sql = "UPDATE evento SET nombre=?, ciudad=?, ciudadEN=?, pais=?, paisEN=? WHERE idEvento=?;"
    mysqlConnection.query(sql, [evento.nombre, evento.ciudad, evento.ciudadEN, evento.pais, evento.paisEN, evento.idEvento], (err, rows, fields)=>{
        if(!err){
            res.send({status: 1, message: 'La evento ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

module.exports = Router;