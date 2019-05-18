const mysql = require('mysql');

const conn = mysql.createConnection({
    host: 'learnetdb.czpoywuktnuq.us-east-1.rds.amazonaws.com',
    user: 'learnet',
    password: 'aftcpride',
    database: 'learnetdb',
    timeout: 60000
    // host: 'localhost',
    // user: 'root',
    // password: '',
    // database: 'appchallenge'
});

module.exports = conn;
