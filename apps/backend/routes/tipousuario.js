const express = require("express");
const mysqlConnection = require("../connection");

const Router = express.Router();

Router.get("/get-tipousuario", (req, res) =>{
    mysqlConnection.query("SELECT * from tipouser", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/post-tipousuario", (req, res) =>{
    let tipouser = req.body;
    var sql = "INSERT INTO tipousuario (idTipoUsuario, nombre, fechaCreacion, fechaActualizacion) VALUES(?,?,?,?);";
    mysqlConnection.query(sql, [tipouser.idTipoUsuario, tipouser.nombre, tipouser.fechaCreacion, tipouser.fechaActualizacion], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El tipousuario ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-tipousuario/:id", (req, res) =>{
    mysqlConnection.query("DELETE tipousuario WHERE idTipoUsuario = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            rows.forEach(element => {
                if(element.constructor == Array){
                    res.send("Insertado id: "+element[0].idtipousuario);
                }
            });
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-tipousuario", (req, res) =>{
    let tipouser = req.body;
    var sql = "UPDATE tipousuario SET idTipoUsuario=?, nombre=?, fechaCreacion=?, fechaActualizacion=? WHERE  idTipoUsuario=?;"
    mysqlConnection.query(sql, [tipouser.idtipousuario, tipouser.idTipoUsuario, tipouser.nombre, tipouser.fechaCreacion, tipouser.fechaActualizacion], (err, rows, fields)=>{
        if(!err){
            res.send({message: 'El tipousuario ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

module.exports = Router;

//INSERT INTO `tesis`.`tipouser` (`idTipoUsuario`, `nombre`, `fechaCreacion`, `fechaActualizacion`) VALUES ('1', 'Administrador', '2020-01-15', '2020-01-15');