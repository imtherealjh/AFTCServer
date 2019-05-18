var Inventory = require('../model/inventoryModel');
var Logger = require('../model/loggerModel');


exports.getInventory = function (req, res){
    Inventory.getAllInventory(function(err, result) {
        if(err) {
            res.status(400).send('');
            return;
        }
        res.send(result);
    });
};



exports.getLastRecordInventory = function(req, res) {
    Inventory.getLastRecordinInventory(function (err, result) {
        if(err) {
            res.status(400).send('Error 400');
            return;
        }
        res.send(result);
    })
};


exports.updateInventory = function (req, res){

    const inventoryDetails = new Inventory(req.body);

    Logger.updateInventoryLog(inventoryDetails, function(err, result) {
        if(err) {
            res.status(400).send('');
            return;
        }
        res.send(result);

    });

    setTimeout(() => {
        Inventory.updateInventory(inventoryDetails, function(err, result) {
            if(err) {
                res.status(400).send('');
                return;
            }
            res.send(result);


        });
    }, 2000);



};

exports.returnTablet = function (req, res){

};
