const express = require("express");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const Router = express.Router();

Router.get("/get-prefijo", (req, res) =>{
    mysqlConnection.query("SELECT * from prefijo", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/post-prefijo", checkToken,(req, res) =>{
    let prefijo = req.body;
    var sql = "INSERT INTO prefijo (idPrefijo, nombre, fechaCreacion, fechaActualizacion) VALUES(?,?,?,?);";
    mysqlConnection.query(sql, [prefijo.idPrefijo, prefijo.nombre, prefijo.fechaCreacion, prefijo.fechaActualizacion], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El prefijo ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-prefijo/:id", checkToken,(req, res) =>{
    mysqlConnection.query("DELETE prefijo WHERE idPrefijo = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            rows.forEach(element => {
                if(element.constructor == Array){
                    res.send("Insertado id: "+element[0].idprefijo);
                }
            });
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-prefijo", checkToken,(req, res) =>{
    let prefijo = req.body;
    var sql = "UPDATE prefijo SET idPrefijo=?, nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idPrefijo=?;"
    mysqlConnection.query(sql, [prefijo.idprefijo, prefijo.idPrefijo, prefijo.nombre, prefijo.fechaCreacion, prefijo.fechaActualizacion], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El prefijo ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

module.exports = Router;
