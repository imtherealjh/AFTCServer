const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const scheduler = require('node-schedule');

const schedulerController = require('./controller/scheduleController');

const db = require('./db-connection');
const appRoute = require('./route/appRoute');

//allow cors, since server is hosted on different port
app.use(function(req, res, next) {
    const clientOrigin = (req.headers.origin === null || req.headers.origin === undefined) ? req.headers['Origin'] : req.headers.origin;

    res.setHeader('Access-Control-Allow-Origin', clientOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true); 

    next();
});

app.use(cookieParser());
app.set('trust proxy', true);   

//for parsing incoming data into json object 
app.use(bodyParser.urlencoded({extended: false})); 
app.use(bodyParser.json());
//to use validator
app.use(expressValidator());
//for routing

app.use('/api', appRoute);

db.connect(function (err){
    if(err) throw err;
    console.log('Successfully connected to database!!!');
});

// `` For strings with dynamic values
// check which port the server is assigned to and make the server listen to that port
const port = process.env.port || 3000;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    //when everything is ready schedule a daily task
    scheduler.scheduleJob('0 59 23 * * *', schedulerController.schedulingJob);
});