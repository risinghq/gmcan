const express = require("express");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");

const Router = express.Router();

Router.get("/get-tipopermiso", checkToken, (req, res) =>{
    mysqlConnection.query("SELECT * from tipopermiso", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/post-tipopermiso", checkToken,(req, res) =>{
    let tipopermiso = req.body;
    var sql = "INSERT INTO tipopermiso (idTipoPermiso, nombre, fechaCreacion, fechaActualizacion) VALUES(?,?,?,?);";
    mysqlConnection.query(sql, [tipopermiso.idTipoPermiso, tipopermiso.nombre, tipopermiso.fechaCreacion, tipopermiso.fechaActualizacion], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El tipopermiso ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-tipopermiso/:id", checkToken,(req, res) =>{
    mysqlConnection.query("DELETE tipopermiso WHERE idTipoPermiso = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            rows.forEach(element => {
                if(element.constructor == Array){
                    res.send("Insertado id: "+element[0].idtipopermiso);
                }
            });
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-tipopermiso", checkToken,(req, res) =>{
    let tipopermiso = req.body;
    var sql = "UPDATE tipopermiso SET idTipoPermiso=?, nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idTipoPermiso=?;"
    mysqlConnection.query(sql, [tipopermiso.idtipopermiso, tipopermiso.idTipoPermiso, tipopermiso.nombre, tipopermiso.fechaCreacion, tipopermiso.fechaActualizacion], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El tipopermiso ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

module.exports = Router;
