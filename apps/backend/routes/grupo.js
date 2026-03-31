const express = require("express");
const mysqlConnection = require("./../connection");

const { checkToken } = require("../auth/token_validation");

var fs=require("fs");
var path=require("path");
const multer = require('multer');
const md_upload = multer({ storage: multer.diskStorage({
    destination: './uploads/grupo',
    filename: (req, file, cb) => cb(null, file.originalname)
}) }).any();



const Router = express.Router();

Router.get("/get-grupo", (req, res) =>{
    mysqlConnection.query("SELECT * from grupo", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-grupo-en", (req, res) =>{
    mysqlConnection.query("SELECT idGrupo, quienesSomosResumenEN as 'quienesSomosResumen', direccion, correo, nombreGrupo2, trabajosFuturosEN as 'trabajosFuturos', telefono ,logoHeader, logoFooter from grupo", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-grupo-facilidades", (req, res) =>{
    mysqlConnection.query("SELECT facilidadesRecursos, facilidadesRecursosEN, facilidadesRecursosFoto, idGrupo from grupo", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.get("/get-grupo-trabajosfuturos", (req, res) =>{
    mysqlConnection.query("SELECT trabajosFuturos, trabajosFuturosEN, idGrupo from grupo", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-grupo-facilidades", checkToken, (req, res) =>{
    let grupo = req.body;
    var sql = "UPDATE grupo SET facilidadesRecursos=?, facilidadesRecursosEN=? WHERE  idGrupo=?;"
    mysqlConnection.query(sql, [grupo.facilidadesRecursos, grupo.facilidadesRecursosEN, grupo.idGrupo], (err, rows, fields)=>{
        if(!err){
            res.send({status:1,message: 'El grupo ha sido actualizada'});
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-grupo-trabajosfuturos", checkToken, (req, res) =>{
    let grupo = req.body;
    var sql = "UPDATE grupo SET trabajosFuturos=?, trabajosFuturosEN=? WHERE idGrupo=?;"
    mysqlConnection.query(sql, [grupo.trabajosFuturos, grupo.trabajosFuturosEN, grupo.idGrupo], (err, rows, fields)=>{
        if(!err){
            res.send({status:1,message: 'El grupo ha sido actualizado'});
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-grupo-info", checkToken, (req, res) =>{
    let grupo = req.body;
    var sql = "UPDATE grupo SET correo=?, telefono=? WHERE idGrupo=?;"
    mysqlConnection.query(sql, [grupo.correo, grupo.telefono, grupo.idGrupo], (err, rows, fields)=>{
        if(!err){
            res.send({status:1,message: 'El grupo ha sido actualizado'});
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-grupo-seccionpresentacion", checkToken, (req, res) =>{
    let grupo = req.body;
    var sql = "UPDATE grupo SET quienesSomosResumen=?, quienesSomosResumenEN=? WHERE idGrupo=?;"
    mysqlConnection.query(sql, [grupo.quienesSomosResumen, grupo.quienesSomosResumenEN, grupo.idGrupo], (err, rows, fields)=>{
        if(!err){
            res.send({status:1,message: 'El grupo ha sido actualizado'});
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-grupo-seccionpublicaciones", checkToken, (req, res) =>{
    let grupo = req.body;
    var sql = "UPDATE grupo SET seccionPublicaciones=?, seccionPublicacionesEN=? WHERE idGrupo=?;"
    mysqlConnection.query(sql, [grupo.seccionPublicaciones, grupo.seccionPublicacionesEN, grupo.idGrupo], (err, rows, fields)=>{
        if(!err){
            res.send({status:1,message: 'El grupo ha sido actualizado'});
        }else{
            console.log(err);
        }
    })
})

Router.put("/update-grupo-seccionproyectos", checkToken, (req, res) =>{
    let grupo = req.body;
    var sql = "UPDATE grupo SET seccionProyectos=?, seccionProyectosEN=? WHERE idGrupo=?;"
    mysqlConnection.query(sql, [grupo.seccionProyectos, grupo.seccionProyectosEN, grupo.idGrupo], (err, rows, fields)=>{
        if(!err){
            res.send({status:1,message: 'El grupo ha sido actualizado'});
        }else{
            console.log(err);
        }
    })
})

Router.put("/upload-image-facilidades/:id", checkToken, md_upload, (req, res) =>{
    let grupo=req.body;
    var sql = "UPDATE grupo SET facilidadesRecursosFoto=? WHERE idGrupo="+ req.params.id+" ;";
	if(req.files && req.files.length > 0){
		var file = req.files[0];
		grupo.foto = file.filename;
		var file_ext = path.extname(file.originalname).slice(1).toLowerCase();
		if (file_ext == 'jpg' || file_ext == 'png' || file_ext == 'jpeg') {
            mysqlConnection.query(sql, [grupo.foto], (err, rows, fields)=>{
                if(!err){
                    res.send({message: 'La foto de facilidades ha sido actualizado'});
                }else{
                    console.log(err);
                }
            })
		}else{
			res.status(200).send({message: 'Extensión del archivo no válida solo SVG'});
        }

	}else{
		return res.status(200).send({message: 'No has subido ninguna imagen'});
    }
})

Router.put("/upload-grupo-header/:id", checkToken, md_upload, (req, res) =>{
    let grupo =req.body;
    var sql = "UPDATE grupo SET logoHeader=? WHERE  idGrupo="+ req.params.id+";";
	if(req.files && req.files.length > 0){
		var file = req.files[0];
		grupo.foto = file.filename;
		var file_ext = path.extname(file.originalname).slice(1).toLowerCase();
		if (file_ext == 'png' || file_ext == 'svg') {
            mysqlConnection.query(sql, [grupo.foto], (err, rows, fields)=>{
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

Router.put("/upload-grupo-footer/:id", checkToken, md_upload, (req, res) =>{
    let grupo=req.body;
    var sql = "UPDATE grupo SET logoFooter=? WHERE  idGrupo="+ req.params.id+";";
	if(req.files && req.files.length > 0){
		var file = req.files[0];
		grupo.foto = file.filename;
		var file_ext = path.extname(file.originalname).slice(1).toLowerCase();
		if (file_ext == 'png' || file_ext == 'svg') {
            mysqlConnection.query(sql, [grupo.foto], (err, rows, fields)=>{
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

Router.get("/get-image-grupo/:imageFile", (req, res) =>{
    var imageFile = req.params.imageFile;
    var path_file = './uploads/grupo/'+imageFile
    fs.exists(path_file, function(exists) {
       if(exists){
           res.sendFile(path.resolve(path_file));
       }else{
           res.status(200).send({message:"no existe la imagen"});
       }
    });
})

Router.get("/get-image-facilidades/:imageFile", (req, res) =>{
    var imageFile = req.params.imageFile;
    var path_file = './uploads/grupo/'+imageFile
    fs.exists(path_file, function(exists) {
       if(exists){
           res.sendFile(path.resolve(path_file));
       }else{
           res.status(200).send({message:"no existe la imagen"});
       }
    });
})



module.exports = Router;