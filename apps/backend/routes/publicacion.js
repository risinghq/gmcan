const express = require("express");
const mysqlConnection = require("../connection");

const Router = express.Router();
var fs=require("fs");
var path=require("path");
const multer = require('multer');
const md_upload = multer({ storage: multer.diskStorage({
    destination: './uploads/publicaciones',
    filename: (req, file, cb) => cb(null, file.originalname)
}) }).any();

Router.get("/get-publicacion", (req, res) =>{
    mysqlConnection.query("SELECT * from publicacion", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-publicacion-en", (req, res) =>{
    mysqlConnection.query("SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-publicacion/:id", (req, res) =>{
    mysqlConnection.query("SELECT * from publicacion WHERE idPublicacion=?", [req.params.id],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-publicacion-en/:id", (req, res) =>{
    mysqlConnection.query("SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion WHERE idPublicacion=?", [req.params.id],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-publicaciones/:id", (req, res) =>{
    mysqlConnection.query("SELECT * from publicacion WHERE tipoPublicacion_idTipoPublicacion=?", [req.params.id],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-publicaciones-en/:id", (req, res) =>{
    mysqlConnection.query("SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion WHERE tipoPublicacion_idTipoPublicacion=?", [req.params.id],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-publicacionesciudad/:id", (req, res) =>{
    mysqlConnection.query("SELECT * from publicacion WHER = ?", [req.params.id],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-publicacionesciudad-en/:id", (req, res) =>{
    mysqlConnection.query("SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion WHER=?", [req.params.id],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-publicacionesevento/:id", (req, res) =>{
    mysqlConnection.query("SELECT * from publicacion WHERE evento_idEvento = ?", [req.params.id],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-publicacionesevento-en/:id", (req, res) =>{
    mysqlConnection.query("SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion WHERE evento_idEvento=?", [req.params.id],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-publicacionesuniversidad/:id", (req, res) =>{
    mysqlConnection.query("SELECT * from publicacion WHERE universidad_idUniversidad = ?", [req.params.id],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-publicacionesuniversidad-en/:id", (req, res) =>{
    mysqlConnection.query("SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion WHERE universidad_idUniversidad=?", [req.params.id],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-publicacionesrevista/:id", (req, res) =>{
    mysqlConnection.query("SELECT * from publicacion WHERE revista_idRevista = ?", [req.params.id],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-publicacionesrevista-en/:id", (req, res) =>{
    mysqlConnection.query("SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion WHERE revista_idRevista=?", [req.params.id],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-publicaciones", (req, res) =>{
    let publicacion = req.body;
    publicacion.titulo='%'+publicacion.titulo+'%'
    var sql = "SELECT * from publicacion WHERE titulo LIKE ? AND tipoPublicacion_idTipoPublicacion=?"
    mysqlConnection.query(sql, [publicacion.titulo, publicacion.tipoPublicacion_idTipoPublicacion],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-publicaciones-global", (req, res) =>{
    let publicacion = req.body;
    publicacion.titulo='%'+publicacion.titulo+'%'
    var sql = "SELECT * from publicacion WHERE titulo LIKE ? OR fechaPublicacion LIKE ? OR resumen LIKE ?;"
    mysqlConnection.query(sql, [publicacion.titulo, publicacion.titulo, publicacion.titulo],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/search-publicaciones-global-en", (req, res) =>{
    let publicacion = req.body;
    publicacion.titulo='%'+publicacion.titulo+'%'
    var sql = "SELECT idPublicacion, titulo, archivo, resumenEN as 'resumen', nroRevista, DOI, fechaPublicacion, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, evento_idEvento, tipoTesis_idTipoTesis from publicacion WHERE titulo LIKE ? OR fechaPublicacion LIKE ? OR resumenEN LIKE ?;"
    mysqlConnection.query(sql, [publicacion.titulo, publicacion.titulo, publicacion.titulo],(err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.post("/post-publicacion", (req, res) =>{
    let publicacion = req.body;
    var sql = "INSERT INTO publicacion (titulo,resumen,resumenEN,DOI,fechaPublicacion, nroRevista, tipoPublicacion_idTipoPublicacion, revista_idRevista, universidad_idUniversidad, tipoTesis_idTipoTesis, evento_idEvento) VALUES(?,?,?,?,?,?,?,?,?,?,?);";
    mysqlConnection.query(sql, [publicacion.titulo, publicacion.resumen, publicacion.resumenEN, publicacion.DOI,
        publicacion.fechaPublicacion, publicacion.nroRevista, publicacion.tipoPublicacion_idTipoPublicacion, 
        publicacion.revista_idRevista, publicacion.universidad_idUniversidad, publicacion.tipoTesis_idTipoTesis, publicacion.evento_idEvento], (err, rows, fields)=>{
        if(!err){
            res.send({status:1,idPublicacion: rows.insertId, message: 'La publicacion ha sido guardada'});
        }else{
            console.log(err);
        }
    })
})

Router.delete("/delete-publicacion/:id", (req, res) =>{
    mysqlConnection.query("DELETE FROM publicacion WHERE idPublicacion = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send({status:1});
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-publicacion", (req, res) =>{
    let publicacion = req.body;
    var sql = "UPDATE publicacion SET titulo=?, resumen=?, resumenEN=?, DOI=?, fechaPublicacion=?, nroRevista=? ,tipoPublicacion_idTipoPublicacion=?, revista_idRevista=?, universidad_idUniversidad=? , tipoTesis_idTipoTesis=?, evento_idEvento=? WHERE  idPublicacion=?;"
    mysqlConnection.query(sql, [publicacion.titulo, publicacion.resumen, publicacion.resumenEN, publicacion.DOI,
        publicacion.fechaPublicacion, publicacion.nroRevista, publicacion.tipoPublicacion_idTipoPublicacion, 
        publicacion.revista_idRevista, publicacion.universidad_idUniversidad, publicacion.tipoTesis_idTipoTesis, publicacion.evento_idEvento, publicacion.idPublicacion], (err, rows, fields)=>{
        if(!err){
            res.send({status:1, message: 'La publicacion ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

Router.put("/upload-publicacion-file/:id", md_upload, (req, res) =>{
    let publicacion=req.body;
    var sql = "UPDATE publicacion SET archivo=? WHERE idPublicacion="+ req.params.id+ ";";
	if(req.files && req.files.length > 0){
		var file = req.files[0];
		publicacion.archivo = file.filename;
		var file_ext = path.extname(file.originalname).slice(1).toLowerCase();
		if (file_ext == 'pdf') {
            mysqlConnection.query(sql, [publicacion.archivo], (err, rows, fields)=>{
                if(!err){
                    res.send(rows);
                }else{
                    console.log(err);
                }
            })
		}else{
			res.status(200).send({message: 'Extensión del archivo no válida'});
        }

	}else{
		return res.status(200).send({message: 'No has subido ninguna imagen'});
    }
})

Router.get("/download-publicacion/:pdfFile", (req, res) =>{
    var pdfFile = req.params.pdfFile;
    var path_file = './uploads/publicaciones/'+pdfFile
    fs.exists(path_file, function(exists) {
        if(exists){
            res.download(path_file);
        }
    });
})

Router.get("/get-file-publicacion/:pdfFile", (req, res) =>{
    var pdfFile = req.params.pdfFile;
    var path_file = './uploads/publicaciones/'+pdfFile
    fs.exists(path_file, function(exists) {
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message:"no existe la imagen"});
        }
    });
})

module.exports = Router;