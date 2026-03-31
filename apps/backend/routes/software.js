const express = require("express");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");
const Router = express.Router();

Router.get("/get-software", (req, res) =>{
    mysqlConnection.query("SELECT * from software", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-software-en", (req, res) =>{
    mysqlConnection.query("SELECT idSoftware, nombre, descripcionEN as 'descripcion', moreInfo, fechaActualizacion, grupo_idGrupo from software", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-software/:id", (req, res) =>{
    mysqlConnection.query("SELECT * FROM software WHERE idSoftware = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-software-en/:id", (req, res) =>{
    mysqlConnection.query("SELECT idSoftware, nombre, descripcionEN as 'descripcion', moreInfo, fechaActualizacion, grupo_idGrupo from software WHERE idSoftware = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/post-software", checkToken, (req, res) =>{
    let not = req.body;
    var sql = "INSERT INTO software (nombre,descripcion,descripcionEN,moreInfo,grupo_idGrupo) VALUES(?,?,?,?,?);";
    mysqlConnection.query(sql, [not.nombre, not.descripcion, not.descripcionEN, not.moreInfo, not.grupo_idGrupo], (err, rows, fields)=>{
        if(!err){
            res.send({status:1, message: 'La software ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-software/:id", checkToken, (req, res) =>{
    mysqlConnection.query("DELETE FROM software WHERE idSoftware = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send({status:1, message: 'La software ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-software", checkToken, (req, res) =>{
    let not = req.body;
    var sql = "UPDATE software SET nombre=?, descripcion=?, descripcionEN=?, moreInfo=?, grupo_idGrupo=? WHERE  idSoftware=?;"
    mysqlConnection.query(sql, [not.nombre, not.descripcion, not.descripcionEN, not.moreInfo, not.grupo_idGrupo, not.idSoftware], (err, rows, fields)=>{
        if(!err){
            res.send({status:1,message: 'La software ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

module.exports = Router;