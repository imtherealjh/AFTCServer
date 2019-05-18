//retrieve data and send back to controller
//just like a normal model

const sql = require('../db-connection');

const inventory = function(data) {
    this.username = data.username;
    this.availableTablets = data.availableTablets;
    this.loanTablets = data.loanTablets;
    this.maintainanceTablets = data.maintainanceTablets;
    this.recorddts = data.recorddts;

};

/*
    Function Name:        getLastRecordinInventory
    Function Description: Retrieve the last record in the inventory and display it on update-inventory.html
                          This function will only show the very last record.
    Function to-do:       NIL
 */

inventory.getLastRecordinInventory = function (callback) {
    sql.query("SELECT * FROM inventory ORDER BY inventoryId DESC LIMIT 1", function(err, result){
        if(err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
};

/*
    Function Name:        getAllInventory
    Function Description: Retrieve the all record in the inventory.
    Function to-do:       NIL
 */

inventory.getAllInventory = function (callback) {
    sql.query("SELECT * FROM inventory", function(err, result){
        if(err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
};

/*
    Function Name:        Update Inventory
    Function Description: Retrieve the first record of
                          inventory and store the total tablets of the current total tablets,
                          total loan tablets and total maintenance tablets.
    Function to-do:       Create new record in inventory and when user wants to update the inventory
                          system will take the last record and show it on the page.

 */

inventory.updateInventory = function  (inventory, callback) {
    sql.query("INSERT INTO inventory(username, availableTablets, loanTablets, maintainanceTablets, recorddts)  VALUES (?,?,?,?,?)",
        [inventory.username, inventory.availableTablets, inventory.loanTablets, inventory.maintainanceTablets, inventory.recorddts],
        function(err, result) {
            if(err) {
                console.log(err);
                callback(err, null);
                return;
            }
            callback(null, result);
        });


};

module.exports = inventory;
