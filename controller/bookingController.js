//logics i.e. verification
const Bookings = require('../model/bookingModel');
const Inventory = require('../model/inventoryModel');

const { validationResult } = require('express-validator/check');

exports.getUpcomingBooking = function (req, res){
    Bookings.getAllUpcomingBookings(function(err, result) {
        if(err) {
            console.log(err);
            res.status(400).send('');
            return;
        }
        res.send({result: {type:'success', data: result}});
    });
}

exports.getBookingsById = function(req, res){
    Bookings.getBookingByParams('bookingId', req.params.id, function(err, result) {
        if(err) {
            res.status(404).send({error: err});
            return;
        }
        res.send({result:{type:'success', data: result[0]}});
    });
}

exports.getBookingsByUser = function(req, res){
    Bookings.getBookingByParams('userId', req.currUser.userId, function(err, result) {
        if(err) {
            console.log(err);
            res.status(404).send({error: err});
            return;
        }
        res.send({result:{type:'success', data: result}});
    });
}

exports.addBooking = function(req, res){
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.status(422).json(errors.array());
        return;
    }

    let newBooking = new Bookings(req.body);
    newBooking.status = "BOOKED";
    newBooking.returnedTablets = 0;

    Bookings.getTabletNoByDates(newBooking.startDate, newBooking.endDate, function (err, bookingResult){
        if(err) {
            res.status(404).send({error: err});
            return;
        }

        Inventory.getLastRecordinInventory(function(err, inventoryResult){
            if(err) {
                res.status(404).send({error: err});
                return;
            }

            const bookedTablets = bookingResult.reduce((total, curr) => {
                const bookingDetails = JSON.parse(JSON.stringify(curr));
                return total + bookingDetails.tabletNo;
            }, 0);

            if(newBooking.tabletNo > (inventoryResult[0].availableTablet - bookedTablets)) {
                res.status(404).json({error:{message: "Session is unavailable for booking, Please contact the TST team or POC for help"}});
                return;
            }
            
            newBooking.userId = req.currUser.userId;

            Bookings.addBooking(newBooking, function(err, result) {
                if(err) {
                    res.status(400).send({error: err});
                    return;
                }
                res.send({result: {type: "success", message: "Session have been successfully booked"}});
            });

        })

    });
}

exports.overwriteBooking = function (req, res) {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.status(422).json(errors.array());
        return;
    }

    const updatedDetails = new Bookings(req.body);

    Bookings.getTabletNoByDates(updatedDetails.startDate, updatedDetails.endDate, function (err, bookingResult) {
        if(err) {
            res.status(404).send({error: err});
            return;
        }

        Inventory.getLastRecordinInventory(function(err, inventoryResult){
            if(err) {
                res.status(404).send({error: err});
                return;
            }

            const bookedTablets = bookingResult.reduce((total, curr) => {
                const bookingDetails = JSON.parse(JSON.stringify(curr));
                if(bookingDetails.bookingId === updatedDetails.bookingId) {
                    return total;
                } else {
                    return total + bookingDetails.tabletNo;
                }
            }, 0);

            if(updatedDetails.tabletNo > (inventoryResult[0].availableTablet - bookedTablets)) {
                res.status(404).json({error:{message: "Session is unavailable to be overwritten, as there are not enough tablets to be loaned"}});
                return;
            }        

            Bookings.overwriteBooking(req.params.id, updatedDetails, function(err, result) {
                if(err) {
                    res.status(404).send({error: err});
                    return;
                }
                res.send({result: {type: 'success'}});
            });

        });
    });
}

exports.extendBooking = function (req,res) {
    const errors = validationResult(req);
    console.log('test');
    if(!errors.isEmpty()) {
        res.status(422).json(errors.array());
        return;
    }

    Bookings.getTabletNoByDates(req.body.startDate, req.body.endDate, function (err, bookingResult) {
        if(err) {
            res.status(404).send({error: err});
            return;
        }

        Inventory.getLastRecordinInventory(function(err, inventoryResult){
            if(err) {
                res.status(404).send({error: err});
                return;
            }

            const bookedTablets = bookingResult.reduce((total, curr) => {
                const bookingDetails = JSON.parse(JSON.stringify(curr));
                return total + bookingDetails.tabletNo;
            }, 0);

            if(req.body.tabletNo > (inventoryResult[0].availableTablet - bookedTablets)) {
                res.status(404).json({error:{message: "Session is unavailable for booking, Please contact the TST team or POC for help"}});
                return;
            }            

            Bookings.extendBooking(req.params.id, req.body.startDate, req.body.endDate, function(err, result) {
                if(err) {
                    res.status(404).send({error: err});
                    return;
                }
                res.send({result: {type: 'success'}});
            });

        });
    });
}

exports.updateBookingDetails = function (req, res){
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.status(422).json(errors.array());
        return;
    }

    Bookings.getBookingByParams('bookingId', req.params.id, function (err, currBookingResult){
        if(err){
            res.status(404).send({error: err});
            return;
        }

        if(currBookingResult === null || currBookingResult === undefined || currBookingResult.length === 0) {
            res.status(404).send({error: "There is no such booking existed"});
            return;
        }

        let currBooking = new Bookings(currBookingResult[0]);
        Bookings.getTabletNoByDates(currBooking.startDate, currBooking.endDate, function (err, bookingResult) {
            if(err) {
                res.status(404).send({error: err});
                return;
            }
    
            Inventory.getLastRecordinInventory(function(err, inventoryResult){
                if(err) {
                    res.status(404).send({error: err});
                    return;
                }
    
                const bookedTablets = bookingResult.reduce((total, curr) => {
                    const bookingDetails = JSON.parse(JSON.stringify(curr));
                    if(bookingDetails.bookingId === currBooking.bookingId ) {
                        return total;
                    }
                    else {
                        return total + bookingDetails.tabletNo;
                    }
                }, 0);
    
                if(req.body.tabletNo > (inventoryResult[0].availableTablet - bookedTablets)) {
                    res.status(404).json({error:{message: "Session is unavailable for booking, Please contact the TST team or POC for help"}});
                    return;
                }            
    
                Bookings.updateBookingDetails(req.params.id, req.body.courseName, req.body.tabletNo, function(err, result) {
                    if(err) {
                        res.status(404).send({error: err});
                        return;
                    }
                    res.send({result: {type: 'success'}});
                });
    
            });
        });
    });
}

exports.returnTablets = function(req, res) {
    //integrate with new client webpages
    //add returnedTablets for booking database
    //scheduling function daily and deduct the number of tablet loaned from the inventory
    
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.status(422).json(errors.array());
        return;
    }
    
    Bookings.getBookingByParams('bookingId', req.body.id, function(err, bookingResult){
        if(err) {
            res.status(404).json({error: err});
            return;
        }

        let currBooking = new Bookings(bookingResult[0]);

        if(currBooking === undefined || currBooking === null || currBooking.length === 0){
            res.status(404).json({ error: { message: 'Booking is not found' }});
            return;
        } 

        Inventory.getLastRecordinInventory(function(err, inventoryResult) {
            if(err) {
                res.status(404).json({error: err});
                return;
            }

            if(req.body.returnTablets > currBooking.tabletNo) {
                res.status(404).json({error: 'Number of returning tablets cannot be more than the number of tablets booked'});
                return;
            }
            
            let currInventory = new Inventory(inventoryResult[0]);
            currInventory.availableTablets = currInventory.availableTablets + parseInt(req.body.returnTablets);
            currInventory.loanTablets = currInventory.loanTablets - parseInt(req.body.returnTablets);
            currInventory.username = "Admin";
            currInventory.recorddts = new Date().getFullYear() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getDate();

            currBooking.returnedTablets = currBooking.returnedTablets + parseInt(req.body.returnTablets);
            currBooking.tabletNo = currBooking.tabletNo - parseInt(req.body.returnTablets);
            currBooking.status = (currBooking.tabletNo === 0) ? "RETURNED" : "SEMI-RETURNED";

            Bookings.overwriteBooking(currBooking.bookingId, currBooking, function(err) {
                if(err){
                    res.status(404).json({error: err});
                    return;
                }

                Inventory.updateInventory(currInventory, function(err){
                    if(err) {
                        res.status(404).json({error: err});
                        return;
                    }
                    res.json({result: {type: 'success'}});
                });
            }, 'all');

        });
    });

}



// exports.deleteBooking = function (req, res){
//     bookings.deletBooking(req.params.id, function(err, result) {
//         if(err) {
//             res.status(400).send('');
//             return;
//         }
//         res.send(result);
//     });
// }