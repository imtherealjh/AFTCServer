const bookingModel = require('../model/bookingModel');
const inventoryModel = require('../model/inventoryModel');
const loggerModel = require('../model/loggerModel');

exports.schedulingJob = function () {
    const currDate = new Date();
    const formattedDate = currDate.getFullYear() + "/" + (currDate.getMonth() + 1) + "/" + currDate.getDate();

    console.log(formattedDate);

    bookingModel.getBookingByStart(formattedDate, function(err, bookingResults) {
        if(err) {
            console.log(err);
            return;
        }

        if(bookingResults === undefined || bookingResults === null || bookingResults.length === 0) {
            console.log('There is no task for scheduling right now!');
            return;
        }

        inventoryModel.getLastRecordinInventory(function(err, inventoryResult) {
            if(err) {
                console.log(err);
                return;
            }

            const currInventory = new inventoryModel(inventoryResult[0]);

            if(currInventory.recorddts === formattedDate) {
                console.log("The record havve been already updated");
                return;
            }

            const totalTablets = bookingResults.reduce((total, curr) => {
                const bookingDetails = JSON.parse(JSON.stringify(curr));
                return total + bookingDetails.tabletNo;
            }, 0);

            currInventory.availableTablets = currInventory.availableTablets - totalTablets;
            currInventory.loanTablets = currInventory.loanTablets + totalTablets;
            currInventory.username = "Admin";
            currInventory.recorddts = formattedDate;
            
            loggerModel.updateInventoryLog(currInventory, function(err) {
                if(err) {
                    console.log(err);
                    return;
                }

                console.log("Archive have been updated!");

                inventoryModel.updateInventory(currInventory, function(err, result){
                    if(err) {
                        console.log(err);
                        return;
                    }
    
                    console.log("Inventory have been updated!!");
                });
                // end of update inventory
               
            });
            // end of update inventory log
        });
        // end of getting last record in inventory
    });
    // end of get bookings by currDate
};