//retrieve data and send back to controller
//just like a normal model

const sql = require('../db-connection');

const users = function(user) {
    this.userName = user.userName;
    this.unit = user.unit;  
    this.contactNo = user.contactNo;
    this.role = user.role;
    this.userId = user.userId;
    this.TOS = user.TOS;
};

users.createUser = function(user, callback) {
    sql.query("INSERT INTO users SET ?", user, function(err,result){
        if(err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}

users.retrieveUserDetails = function(params, paramsData, callback) {
    sql.query(`SELECT * FROM users WHERE ${params} = ?`, paramsData, function(err, result) {
        if(err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}

users.updateUserDetails = function(users, callback) {
    sql.query('UPDATE users SET ? WHERE userId = ?', [users, users.userId], function(err, result) {
        if(err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}

module.exports = users;