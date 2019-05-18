const sql = require('../db-connection');
const inventoryModel = require('./inventoryModel');

var Logger = function(logger) {
    this.id = logger.id;
    this.message = logger.message;
};

Logger.retrieveAllLogs = function (callback) {
    sql.query("SELECT * FROM inventoryArchive", function(err, result){
        if(err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
};


Logger.createNewBookingLog = function (callback, bookings) {
    var message = bookings.username + " has booked "
        + bookings.tabletNo + "tablets for "
        + bookings.courseName + ".The course will start on "
        + bookings.startDate + " and ends on "
        + bookings.endDate + ".";
    sql.query("INSERT INTO bookingArchive SET message = ?", [message] , function(err, result) {
        if(err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
};



Logger.updateBookingLog = function (callback, bookings) {
    var message = bookings.username + " has amended "
        + bookings.tabletNo + "tablets for "
        + bookings.courseName + ".The course will start on "
        + bookings.startDate + " and ends on "
        + bookings.endDate + ".";
    sql.query("INSERT INTO bookingArchive SET message = ?", [message] , function(err, result) {
        if(err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
};


Logger.extendBookingLog = function (callback, bookings) {
    var message = bookings.username + " has extended duration of his course "
        + bookings.courseName + ".The course will start on "
        + bookings.startDate + " and ends on "
        + bookings.endDate + ".";
    sql.query("INSERT INTO bookingArchive SET message = ?", [message] , function(err, result) {
        if(err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
};


Logger.updateInventoryLog = function (inventory, callback) {


    inventoryModel.getLastRecordinInventory((err, result) => {
        // Logging into Archive
        var message = inventory.username + " updated current available inventory from "
            + result[0].availableTablets + " to " +  inventory.availableTablets
            + ", loan tablets from " + result[0].loanTablets + " to " + inventory.loanTablets
            + " and maintainance tablets from " + result[0].maintainanceTablets + " to " + inventory.maintainanceTablets;


        sql.query("INSERT INTO inventoryArchive(message) VALUES (?)", [message] , function(err, result) {

            if(err) {
                callback(err, null);
                console.log(err);
                return;
            }
            callback(null, result);
        });
    });

};

module.exports = Logger;
