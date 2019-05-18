var Logger = require('../model/loggerModel');

exports.getAllLogs = function (req, res){
    Logger.retrieveAllLogs(function(err, result) {
        if(err) {
            res.status(400).send('');
            return;
        }
        res.send(result);
    });
};

exports.createNewBookingLog = function (req, res) {
    var newLogs = new Logger(req.body);

    if(!newLogs) {
        res.status(400).send({ error:true, message: '' });
    } else {
        Logger.createNewBookingLog(newLogs, function(err, log) {
            if(err) res.send(err);
            res.json(log);
        });
    }
};

exports.updateInventoryLog = function (req, res) {
    var newLogs = new Logger(req.body);

    if(!newLogs) {
        res.status(400).send({ error:true, message: '' });
    } else {
        Logger.updateInventoryLog(newLogs, function(err, log) {
            if(err) res.send(err);
            res.json(log);
        });
    }
};
