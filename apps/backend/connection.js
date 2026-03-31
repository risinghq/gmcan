const mysql = require("mysql");
var mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "tesis",
    multipleStatements: true
})

mysqlConnection.connect((err)=>{
    if (!err) {
        console.log("Connection succesful");
    }else{
        console.log(err)
    }
})

module.exports = mysqlConnection;