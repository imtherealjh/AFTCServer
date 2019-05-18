//retrieve data and send back to controller
//just like a normal model
const sql = require('../db-connection');

const bookings = function(booking) {
    this.bookingId = booking.bookingId;
    this.startDate = booking.startDate;
    this.endDate = booking.endDate;
    this.courseName = booking.courseName;
    this.tabletNo = booking.tabletNo;
    this.returnedTablets = booking.returnedTablets;
    this.status = booking.status;
};

bookings.getAllUpcomingBookings = function(callback) {
    const formattedDate = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate();

    sql.query(`SELECT bookingId, startDate, endDate, courseName, tabletNo, returnedTablets, status FROM bookings ` + 
    `WHERE CAST(startDate as DATE) > CAST(? as DATE) AND (status = "BOOKED" OR status = "SEMI-RETURNED")`, 
    formattedDate, function(err, result) {
        if(err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}


bookings.getBookingByParams = function(params, paramsData, callback) {
    const formattedDate = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate();

    sql.query(`SELECT bookingId, startDate, endDate, courseName, tabletNo, returnedTablets, status FROM bookings WHERE ${params} = ? ` +
    'AND CAST(startDate AS DATE) > CAST(? as DATE) AND (status = "BOOKED" OR status = "SEMI-RETURNED")', [paramsData, formattedDate], function(err, result) {
        if(err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}

bookings.getBookingByStart = function(currDate, callback) {
    let sqlStatement = `SELECT bookingId, startDate, endDate, courseName, tabletNo, returnedTablets, status FROM bookings WHERE CAST(startDate as DATE) = CAST(? as DATE)` +
                    `WHERE status = 'BOOKED'`;

    sql.query(sqlStatement, currDate, function(err, result) {
        if(err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}

bookings.getTabletNoByDates = function(startDate, endDate, callback) {
    sql.query("SELECT tabletNo FROM bookings WHERE (? BETWEEN CAST(startDate AS date) AND CAST(endDate as date)) OR"
                + "(? BETWEEN CAST(startDate AS date) AND CAST(endDate as date)) AND (status = 'BOOKED' OR status='SEMI-RETURNED')", 
        [startDate, endDate], 
        function(err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            callback(null, result);
        }
    );
}

bookings.addBooking = function(bookings, callback) {
    sql.query("INSERT INTO bookings SET ?", bookings, function(err, result) {
        if(err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}

bookings.updateBookingDetails = function(id, courseName, tabletNo, callback) {
    sql.query("UPDATE bookings SET courseName = ?, tabletNo = ? WHERE bookingId = ?", 
        [courseName, tabletNo, id], 
        function(err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            callback(null, result);
    });
}

bookings.extendBooking = function(id, startDate, endDate, callback) {
    sql.query("UPDATE bookings SET startDate = ?, endDate = ? WHERE bookingId = ?", 
        [startDate, endDate, id], 
        function(err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            callback(null, result);
    });
}

bookings.overwriteBooking = function (id, booking, callback, type) {
    if(type === 'all') {
        sql.query('UPDATE bookings SET startDate = ?, endDate = ?, courseName = ?, tabletNo = ?, returnedTablets = ? , '+
                    'status = ? WHERE bookingId = ?', 
        [booking.startDate, booking.endDate, booking.courseName, booking.tabletNo, booking.returnedTablets, booking.status, id], 
        function(err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            callback(null, result);
        });
    } 
    else {
    sql.query("UPDATE bookings SET startDate = ?, endDate = ?, courseName = ?, tabletNo = ? WHERE bookingId = ?", 
        [booking.startDate, booking.endDate, booking.courseName, booking.tabletNo, id], 
        function(err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            callback(null, result);
        });
    }
}

// bookings.deleteBooking = function (id, callback) {
//     sql.query("DELETE FROM bookings WHERE id = ?", id, function(err, result) {
//         if(err) {
//             callback(err, null);
//             return;
//         }
//         callback(null, result);
//     });
// }

module.exports = bookings;