const express = require("express");
const mysqlConnection = require("../connection");
const { checkToken } = require("../auth/token_validation");
var fs=require("fs");
var path=require("path");
const multer = require('multer');
const md_upload = multer({ storage: multer.diskStorage({
    destination: './uploads/lineainvestigacion',
    filename: (req, file, cb) => cb(null, file.originalname)
}) }).any();

const Router = express.Router();

Router.get("/get-lineasinvestigacion", (req, res) =>{
    mysqlConnection.query("SELECT * from lineasinvestigacion", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-lineasinvestigacion-en", (req, res) =>{
    mysqlConnection.query("SELECT idLineasInvestigacion, nombreEN as 'nombre', descripcionEN as 'descripcion' from lineasinvestigacion", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-lineasinvestigacion/:id", (req, res) =>{
    mysqlConnection.query("SELECT * FROM lineasinvestigacion WHERE idLineasInvestigacion = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-lineasinvestigacion-en/:id", (req, res) =>{
    mysqlConnection.query("SELECT idLineasInvestigacion, nombreEN as 'nombre', descripcionEN as 'descripcion' FROM lineasinvestigacion WHERE idLineasInvestigacion = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-lineasinvestigacion", (req, res) =>{
    let lineasinvestigacion = req.body;
    lineasinvestigacion.nombre='%'+lineasinvestigacion.nombre+'%'
    var sql = "SELECT * from lineasinvestigacion WHERE nombre LIKE ?;"
    mysqlConnection.query(sql, [lineasinvestigacion.nombre],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-lineasinvestigacion-en", (req, res) =>{
    let lineasinvestigacion = req.body;
    lineasinvestigacion.nombre='%'+lineasinvestigacion.nombre+'%'
    var sql = "SELECT idLineasInvestigacion, nombreEN as 'nombre',descripcionEN as 'descripcion', grupo_idGrupo from lineasinvestigacion WHERE nombreEN LIKE ?;"
    mysqlConnection.query(sql, [lineasinvestigacion.nombre],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/post-lineasinvestigacion",checkToken, (req, res) =>{
    let lineasinvestigacion = req.body;
    var sql = "INSERT INTO lineasinvestigacion (nombre, nombreEN, descripcion, descripcionEN, grupo_idGrupo) VALUES(?,?,?,?,?);";
    mysqlConnection.query(sql, [lineasinvestigacion.nombre, lineasinvestigacion.nombreEN, lineasinvestigacion.descripcion, lineasinvestigacion.descripcionEN, lineasinvestigacion.grupo_idGrupo], (err, rows, fields)=>{
        if(!err){
            res.send({status:1,idLineasInvestigacion: rows.insertId,message: 'La línea ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-lineasinvestigacion/:id", checkToken, (req, res) =>{
    mysqlConnection.query("DELETE FROM lineasinvestigacion WHERE idLineasInvestigacion = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send({status:1, message:"Borrado exitosamente"})
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-lineasinvestigacion", checkToken, (req, res) =>{
    let lineasinvestigacion = req.body;
    var sql = "UPDATE lineasinvestigacion SET nombre=?, nombreEN=?, descripcion=?, descripcionEN=?, grupo_idGrupo=? WHERE  idLineasInvestigacion=?;"
    mysqlConnection.query(sql, [lineasinvestigacion.nombre, lineasinvestigacion.nombreEN, lineasinvestigacion.descripcion, lineasinvestigacion.descripcionEN, lineasinvestigacion.grupo_idGrupo, lineasinvestigacion.idLineasInvestigacion], (err, rows, fields)=>{
        if(!err){
            res.send({status:1 ,message: 'El lineasinvestigacion ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

Router.put("/upload-lineainvestigacion-foto/:id", checkToken, md_upload, (req, res) =>{
    let lineainvestigacion=req.body;
	if(req.files && req.files.length > 0){
		var file = req.files[0];
		lineainvestigacion.foto = file.filename;
		var file_ext = path.extname(file.originalname).slice(1).toLowerCase();
        var sql = "UPDATE lineasinvestigacion SET foto=? WHERE idLineasInvestigacion="+ req.params.id+ ";";
		if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg') {
            mysqlConnection.query(sql, [lineainvestigacion.foto], (err, rows, fields)=>{
                if(!err){
                    res.send(rows);
                }else{
                    console.log(sql);
                }
            })
		}else{
			res.status(200).send({message: 'Extensión del archivo no válida'});
        }
	}else{
		return res.status(200).send({message: 'No has subido ninguna imagen'});
    }
})

Router.get("/get-image-lineainvestigacion/:imageFile", (req, res) =>{
    var imageFile = req.params.imageFile;
    var path_file = './uploads/lineainvestigacion/'+imageFile
    fs.exists(path_file, function(exists) {
       if(exists){
           res.sendFile(path.resolve(path_file));
       }else{
           res.status(200).send({message:"no existe la imagen"});
       }
    });
})

module.exports = Router;