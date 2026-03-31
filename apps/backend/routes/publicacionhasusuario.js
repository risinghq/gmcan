const express = require("express");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const Router = express.Router();

Router.get("/get-publicacionhasusuario", (req, res) =>{
    mysqlConnection.query("SELECT * from publicacion_has_usuario", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-publicacionhasusuario/:id", (req, res) =>{
    let publicacion_has_usuario = req.params.id;
    mysqlConnection.query("SELECT * from publicacion_has_usuario WHERE publicacion_idPublicacion="+publicacion_has_usuario, (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-publicacionhasusuario", (req, res) =>{
    let publicacionhasusuario = req.body;
    var sql = "SELECT * from publicacion_has_usuario WHERE usuario_DNI=?"
    mysqlConnection.query(sql, [publicacionhasusuario.usuario_DNI],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/post-publicacionhasusuario", checkToken, (req, res) =>{
    let publicacionhasusuario = req.body;
    var sql = "INSERT INTO publicacion_has_usuario (usuario_DNI, publicacion_idPublicacion, isPrincipal) VALUES(?,?,?);";
    mysqlConnection.query(sql, [publicacionhasusuario.usuario_DNI, publicacionhasusuario.publicacion_idPublicacion,publicacionhasusuario.isPrincipal], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El publicacion_has_usuario ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-publicacionhasusuario/:id", checkToken, (req, res) =>{
    mysqlConnection.query("DELETE FROM publicacion_has_usuario WHERE publicacion_idPublicacion=?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send({status:1, message:"Borrado exitosamente"})
        }else{
            console.log(err);
            res.send({status:1, message: 'La publicacion no existe'});
        }
    })
})

Router.put("/update-publicacionhasusuario", checkToken,(req, res) =>{
    let publicacionhasusuario = req.body;
    var sql = "UPDATE publicacion_has_usuario SET usuario_DNI=?, publicacion_idPublicacion=?, fechaCreacion=?,fechaActualizacion=?, isPrincipal=? WHERE  usuario_DNI=? AND publicacion_idPublicacion=?;"
    mysqlConnection.query(sql, [publicacionhasusuario.usuario_DNI, publicacionhasusuario.publicacion_idPublicacion, publicacionhasusuario.fechaCreacion, publicacionhasusuario.fechaActualizacion, publicacionhasusuario.isPrincipal], (err, rows, fields)=>{
        if(!err){
            res.send({status:1 ,message: 'El publicacion_has_usuario ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

module.exports = Router;