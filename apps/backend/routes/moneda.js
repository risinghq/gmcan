const express = require("express");
const mysqlConnection = require("../connection");

const Router = express.Router();

Router.get("/get-moneda", (req, res) =>{
    mysqlConnection.query("SELECT * from moneda", (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})


Router.get("/get-moneda/:id", (req, res) =>{
    mysqlConnection.query("SELECT * FROM moneda WHERE idMoneda = ?",[req.params.id], (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
    })
})

module.exports = Router;