const express = require("express");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const Router = express.Router();

Router.get("/get-usuariohaspermiso", checkToken, (req, res) =>{
    mysqlConnection.query("SELECT * from usuarioHasPermiso", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-usuariohaspermiso/:id", checkToken, (req, res) =>{
    let usuarioHasPermiso = req.params.id;
    mysqlConnection.query("SELECT * from usuarioHasPermiso WHERE usuario_DNI="+usuarioHasPermiso, (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/post-usuariohaspermiso", checkToken,(req, res) =>{
    let usuarioHasPermiso = req.body;
    var sql = "INSERT INTO usuarioHasPermiso (usuario_DNI, permiso_idPermiso) VALUES(?,?);";
    mysqlConnection.query(sql, [usuarioHasPermiso.usuario_DNI, usuarioHasPermiso.permiso_idPermiso], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El usuarioHasPermiso ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-usuariohaspermiso/:id", checkToken,(req, res) =>{
    mysqlConnection.query("DELETE FROM usuarioHasPermiso WHERE usuario_DNI=?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send({status:1});
        }else{
            console.log(err);
        }
    })
})

module.exports = Router;
