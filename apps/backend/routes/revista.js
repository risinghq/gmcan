const express = require("express");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const Router = express.Router();

Router.get("/get-revista", (req, res) =>{
    mysqlConnection.query("SELECT * from revista", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-revista/:id", (req, res) =>{
    mysqlConnection.query("SELECT * FROM revista WHERE idRevista = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-revistas", (req, res) =>{
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

Router.post("/post-revista", checkToken, (req, res) =>{
    let not = req.body;
    var sql = "INSERT INTO revista (nombre) VALUES(?);";
    mysqlConnection.query(sql, [not.nombre], (err, rows, fields)=>{
        if(!err){
            res.send({status:1, message: 'La revista ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-revista/:id", checkToken, (req, res) =>{
    mysqlConnection.query("DELETE FROM revista WHERE idRevista = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send({status:1 ,message:"Eliminado revista"});
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-revista", checkToken, (req, res) =>{
    let not = req.body;
    var sql = "UPDATE revista SET nombre=? WHERE idRevista=?;"
    mysqlConnection.query(sql, [not.nombre,not.idRevista], (err, rows, fields)=>{
        if(!err){
            res.send({status:1 , message: 'La revista ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

module.exports = Router;