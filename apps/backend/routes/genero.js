const express = require("express");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const Router = express.Router();

Router.get("/get-genero", (req, res) =>{
    mysqlConnection.query("SELECT * from genero", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/post-genero", checkToken,(req, res) =>{
    let genero = req.body;
    var sql = "INSERT INTO genero (idGenero, nombre, fechaCreacion, fechaActualizacion) VALUES(?,?,?,?);";
    mysqlConnection.query(sql, [genero.idGenero, genero.nombre, genero.fechaCreacion, genero.fechaActualizacion], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El genero ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-genero/:id", checkToken,(req, res) =>{
    mysqlConnection.query("DELETE genero WHERE idGenero = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            rows.forEach(element => {
                if(element.constructor == Array){
                    res.send("Insertado id: "+element[0].idgenero);
                }
            });
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-genero", checkToken,(req, res) =>{
    let genero = req.body;
    var sql = "UPDATE genero SET idGenero=?, nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idGenero=?;"
    mysqlConnection.query(sql, [genero.idgenero, genero.idGenero, genero.nombre, genero.fechaCreacion, genero.fechaActualizacion], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El genero ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

module.exports = Router;
