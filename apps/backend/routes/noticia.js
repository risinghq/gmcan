const express = require("express");
const mysqlConnection = require("../connection");

const Router = express.Router();
const { checkToken } = require("../auth/token_validation");

var fs=require("fs");
var path=require("path");
const multer = require('multer');
const md_upload = multer({ storage: multer.diskStorage({
    destination: './uploads/noticia',
    filename: (req, file, cb) => cb(null, file.originalname)
}) }).any();

Router.get("/get-noticia", (req, res) =>{
    mysqlConnection.query("SELECT * from noticia", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-noticia-en", (req, res) =>{
    mysqlConnection.query("SELECT idNoticia, tituloEN as 'titulo', resumenEN as 'resumen', cuerpoEN as 'cuerpo', estado, fechaPublicacion, fechaActualizacion, foto, prioridad, autorPublicacion, tipoNoticia_idtipoNoticia  from noticia", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-noticia/:id", (req, res) =>{
    mysqlConnection.query("SELECT * FROM noticia WHERE idNoticia = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-noticia-en/:id", (req, res) =>{
    mysqlConnection.query("SELECT idNoticia, tituloEN as 'titulo', resumenEN as 'resumen', cuerpoEN as 'cuerpo', estado, fechaPublicacion, fechaActualizacion, foto, prioridad, autorPublicacion, tipoNoticia_idtipoNoticia from noticia WHERE idNoticia = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-noticiausuario/:id", (req, res) =>{
    mysqlConnection.query("SELECT * FROM noticia WHERE autorPublicacion = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-noticiausuario-en/:id", (req, res) =>{
    mysqlConnection.query("SELECT idNoticia, tituloEN as 'titulo', resumenEN as 'resumen', cuerpoEN as 'cuerpo', estado, fechaPublicacion, fechaActualizacion, foto, prioridad, autorPublicacion, tipoNoticia_idtipoNoticia from noticia WHERE autorPublicacion = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-noticiatipo/:id", (req, res) =>{
    mysqlConnection.query("SELECT * FROM noticia WHERE tipoNoticia_idtipoNoticia = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-noticiatipo-en/:id", (req, res) =>{
    mysqlConnection.query("SELECT idNoticia, tituloEN as 'titulo', resumenEN as 'resumen', cuerpoEN as 'cuerpo', estado, fechaPublicacion, fechaActualizacion, foto, prioridad, autorPublicacion, tipoNoticia_idtipoNoticia from noticia WHERE tipoNoticia_idtipoNoticia = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-noticiafull/:id", checkToken, (req, res) =>{
    mysqlConnection.query("SELECT * from noticia WHERE idNoticia = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows[0]);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-noticia-global", (req, res) =>{
    let noticia = req.body;
    noticia.titulo='%'+noticia.nombre+'%';
    noticia.codigo='%'+noticia.nombre+'%';
    noticia.resumen='%'+noticia.nombre+'%';
    noticia.fechaPublicacion='%'+noticia.nombre+'%';
    var sql = "SELECT * from noticia WHERE titulo LIKE ? OR cuerpo LIKE ? OR resumen LIKE ? OR fechaPublicacion LIKE ?;"
    mysqlConnection.query(sql, [noticia.titulo, noticia.cuerpo, noticia.resumen, noticia.fechaPublicacion],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-noticia-global-en", (req, res) =>{
    let noticia = req.body;
    noticia.titulo='%'+noticia.nombre+'%';
    noticia.codigo='%'+noticia.nombre+'%';
    noticia.resumen='%'+noticia.nombre+'%';
    noticia.fechaPublicacion='%'+noticia.nombre+'%';
    var sql = "SELECT * from noticia WHERE tituloEN LIKE ? OR cuerpoEN LIKE ? OR resumenEN LIKE ? OR fechaPublicacion LIKE ?;"
    mysqlConnection.query(sql, [noticia.titulo, noticia.cuerpo, noticia.resumen, noticia.fechaPublicacion],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/post-noticia", checkToken, (req, res) =>{
    let not = req.body;
    var sql = "INSERT INTO noticia (titulo, tituloEN, resumen,resumenEN,cuerpo,cuerpoEN,estado, fechaPublicacion,autorPublicacion, tipoNoticia_idtipoNoticia) VALUES(?,?,?,?,?,?,?,?,?,?);";
    mysqlConnection.query(sql, [not.titulo,not.tituloEN, not.resumen, not.resumenEN, not.cuerpo, not.cuerpoEN, not.estado, not.fechaPublicacion, not.autorPublicacion,  not.tipoNoticia_idtipoNoticia], (err, rows, fields)=>{
        if(!err){
            res.send({rows:rows.insertId, status:1, message: 'La noticia ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-noticia/:id", (req, res) =>{
    mysqlConnection.query("DELETE FROM noticia WHERE idNoticia = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send({status:1,message:"Eliminada la noticia"});
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-noticia", (req, res) =>{
    let not = req.body;
    var sql = "UPDATE noticia SET titulo=?, tituloEN=?, resumen=?, resumenEN=?, cuerpo=?, cuerpoEN=?, fechaPublicacion=?, estado=?, autorPublicacion=?, tipoNoticia_idtipoNoticia=? WHERE  idNoticia=?;"
    mysqlConnection.query(sql, [not.titulo, not.tituloEN, not.resumen, not.resumenEN, not.cuerpo, not.cuerpoEN, not.fechaPublicacion, not.estado, not.autorPublicacion, not.tipoNoticia_idtipoNoticia, not.idNoticia], (err, rows, fields)=>{
        if(!err){
            res.send({status:1, message: 'La noticia ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

Router.put("/upload-noticia-file/:id", checkToken, md_upload, (req, res) =>{
    let noticia=req.body;
	if(req.files && req.files.length > 0){
		var file = req.files[0];
		noticia.foto = file.filename;
		var file_ext = path.extname(file.originalname).slice(1).toLowerCase();
        var sql = "UPDATE noticia SET foto=? WHERE idNoticia="+ req.params.id+ ";";
		if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg') {
            mysqlConnection.query(sql, [noticia.foto], (err, rows, fields)=>{
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

Router.get("/get-image-noticia/:imageFile", (req, res) =>{
    var imageFile = req.params.imageFile;
    var path_file = './uploads/noticia/'+imageFile
    fs.exists(path_file, function(exists) {
       if(exists){
           res.sendFile(path.resolve(path_file));
       }else{
           res.status(200).send({message:"no existe la imagen"});
       }
    });
})

module.exports = Router;