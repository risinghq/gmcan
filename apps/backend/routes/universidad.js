const express = require("express");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const Router = express.Router();

Router.get("/get-universidad", (req, res) =>{
    mysqlConnection.query("SELECT * from universidad", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-universidad-en", (req, res) =>{
    mysqlConnection.query("SELECT idUniversidad, nombreEn as 'nombre' from universidad", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-universidad/:id", (req, res) =>{
    mysqlConnection.query("SELECT * from universidad WHERE idUniversidad=?", [req.params.id],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-universidad-en/:id", (req, res) =>{
    mysqlConnection.query("SELECT idUniversidad, nombreEN as 'nombre' from universidad WHERE idUniversidad=?", [req.params.id],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-universidad", (req, res) =>{
    let universidad = req.body;
    universidad.nombre='%'+universidad.titulo+'%'
    var sql = "SELECT * from universidad WHERE nombre LIKE ?"
    mysqlConnection.query(sql, [universidad.nombre],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-universidad-en", (req, res) =>{
    let universidad = req.body;
    universidad.nombre='%'+universidad.nombre+'%'
    var sql = "SELECT idUniversidad, nombreEN as 'nombre' from universidad WHERE nombreEN LIKE ?"
    mysqlConnection.query(sql, [universidad.nombre],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/post-universidad", checkToken, (req, res) =>{
    let universidad = req.body;
    var sql = "INSERT INTO universidad (nombre, nombreEN) VALUES(?,?);";
    mysqlConnection.query(sql, [universidad.nombre, universidad.nombreEN], (err, rows, fields)=>{
        if(!err){
            res.send({status: 1, message: 'El universidad ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-universidad/:id", checkToken, (req, res) =>{
    mysqlConnection.query("DELETE FROM universidad WHERE idUniversidad = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send({status:1 ,message:"Eliminada universidad"});
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-universidad", checkToken, (req, res) =>{
    let universidad = req.body;
    var sql = "UPDATE universidad SET nombre=?, nombreEN=? WHERE  idUniversidad=?;"
    mysqlConnection.query(sql, [universidad.nombre, universidad.nombreEN, universidad.idUniversidad], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El universidad ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

module.exports = Router;