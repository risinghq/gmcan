const express = require("express");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const Router = express.Router();

Router.get("/get-publicacionhasautor", (req, res) =>{
    mysqlConnection.query("SELECT * from publicacion_has_autor", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-publicacionhasautor/:id", (req, res) =>{
    let publicacion_has_autor = req.params.id;
    mysqlConnection.query("SELECT * from publicacion_has_autor WHERE publicacion_idPublicacion="+publicacion_has_autor, (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-publicacionhasautor", (req, res) =>{
    let publicacionhasautor = req.body;
    var sql = "SELECT * from publicacion_has_autor WHERE autores_idAutor=?"
    mysqlConnection.query(sql, [publicacionhasautor.autores_idAutor],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/post-publicacionhasautor", checkToken, (req, res) =>{
    let publicacionhasautor = req.body;
    var sql = "INSERT INTO publicacion_has_autor (autores_idAutor, publicacion_idPublicacion, isPrincipal) VALUES(?,?,?);";
    mysqlConnection.query(sql, [publicacionhasautor.autor_idAutor, publicacionhasautor.publicacion_idPublicacion, publicacionhasautor.isPrincipal], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El publicacion_has_autor ha sido guardada'});
        }else{
            console.log(err);
            res.send({status:1, message: 'La publicacion no existe'});
        }
    })
})

Router.delete("/delete-publicacionhasautor/:id", checkToken, (req, res) =>{
    mysqlConnection.query("DELETE FROM publicacion_has_autor WHERE publicacion_idPublicacion=?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send({status:1, message:"Borrado exitosamente"})
        }else{
            console.log(err);
        }
    })
})

module.exports = Router;