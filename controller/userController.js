//req.query for GET method
//req.body for POST, PUT
const users = require('../model/userModel');

const { validationResult } = require('express-validator/check');

const jwt = require('jsonwebtoken');
const secretKey = generateRandomKey();
const secretBuffer = new Buffer(secretKey, 'utf-8');

const Nexmo = require('nexmo');
const nexmo = new Nexmo({
    apiKey: 'ce023e8d',
    apiSecret: 'b7e9427c4755f934'
});

/*
    Function Name:        Login
    Function Description: Check whether user have been registered in the database
 */

exports.Login = function(req, res){
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.status(422).json(errors.array());
        return;
    }

    //checking with database to see whether the user have been created by the adminstrator
    users.retrieveUserDetails('userName', req.query.userName, function(sqlErr, sqlResult) {
        if(sqlErr) {
            res.status(404).json({ error: { message: err.array() } });
            return;
        }

        //if there is no result found, tell the client that the user is not found
        if(sqlResult === undefined || sqlResult.length === 0){
            res.status(404).json({ error: { message: 'Username not found' }});
            return;
        } 
        else {
            // sendOneTimePw(sqlResult[0], function(nexmoErr, nexmoResult) {
            //     if (nexmoErr) {
            //         res.status(404).json({ error: { message: nexmoErr } });
            //         return;
            //     }
                
                //for verification of one time password
                const token = jwt.sign(JSON.parse(JSON.stringify(sqlResult[0])), secretBuffer, {
                    expiresIn: '60s',
                });

                res.cookie('verifyUser', JSON.stringify({
                    token: token,
                    // requestId: nexmoResult
                }), {
                    maxAge: 60 * 1000,
                    httpOnly: true
                });

                res.json({ result: { type: 'success' }});
            // });
        }
    });  
}

exports.Verification = function(req, res){
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.status(422).json(errors.array());
        return;
    }

    checkCookies(req, 'verifyUser', function (cookieErr,cookieResult) {
        if(cookieErr) {
            res.status(404).json({verifyError: cookieErr});
            return;
        }
        //double check the the token is correct
        decodeJWT(cookieResult.token, function(decodedErr, decodedResult){
            if(decodedErr) {
                res.status(404).json({verifyError: decodedErr});
                return;
            }

            // nexmo.verify.check({
            // request_id: cookieResult.requestId,
            // code: req.body.code
            // }, (err, result) => {
            //     if (err) {
            //         res.status(404).json({ error: err });
            //         return;
            //     }

                res.clearCookie('verifyUser');

                const verifiedUser = new users(decodedResult.decoded);
                const token = jwt.sign(JSON.parse(JSON.stringify(verifiedUser)), secretBuffer, {
                    expiresIn: '86400s',
                });

                //signing of httpOnly cookie, so the user cannot retrieve the values via javascript
                res.cookie('userData', JSON.stringify({
                    token: token
                }), {
                    maxAge: 86400 * 1000, 
                    httpOnly: true
                });
    
                const tosStatus = (verifiedUser.TOS === 1) ? 'Completed' : 'notCompleted';
                res.json({ result: { status: 'success', userRole: verifiedUser.role, userName: verifiedUser.userName,TOS: tosStatus} });
        // });    
        })
        
    });
}

// exports.removeOTP = function (req, res) {
//     const errors = validationResult(req);
//     if(!errors.isEmpty()) {
//         res.status(422).json(errors.array());
//         return;
//     }

//     nexmo.verify.control({
//         request_id: req.body.requestId,
//         cmd: 'cancel'
//         }, (err, result) => {
//         if (err) {
//             res.status(404).json(err.array());
//         } else {
//             res.json({'result':'success'});
//         }
//     });
// }

exports.updateTermsNCond = function (req, res) {
    let updatedUserDetails = new users(req.currUser);
    updatedUserDetails.TOS = 1;
    users.updateUserDetails(updatedUserDetails, function(err, result){
        if(err) {
            res.status(404).json({error: err});
            return;
        }
        res.json({result: {type: 'success', userRole: updatedUserDetails.role, userName: updatedUserDetails.userName}});
    });
}

exports.createUser = function(req, res) {
    const newUser = new users(req.body);
    users.createUser(newUser, function(err, result){
        if(err) {
            return res.json(err);
        }
        res.json(result);
    });
}

exports.verifyUser = function(req, res, next){
    checkCookies(req, 'userData', function(cookieErr, cookieResult) {
        if(cookieErr) { 
            console.log(cookieErr);
            res.status(404).json({verifyError: cookieErr});
            return;
        }

        decodeJWT(cookieResult.token, function (decodedErr, decodedResult) {
            if(decodedErr) {
                console.log(decodedErr);
                res.status(404).json({verifyError: decodedErr});
                return;
            }

            console.log('verified user success!!');

            const currUser = JSON.parse(JSON.stringify(new users(decodedResult.decoded)));
            req.currUser = currUser;
            next();
        });
    })
}

exports.verifyAdmin = function(req, res, next){
    checkCookies(req, 'userData', function(cookieErr, cookieResult) {
        if(cookieErr) {
            res.status(404).json({verifyError: cookieErr});
            return;
        }
        
        decodeJWT(cookieResult.token, function (decodedErr, decodedResult) {
            if(decodedErr) {
                res.status(404).json({verifyError: decodedErr});
                return;
            }

            const currUser = JSON.parse(JSON.stringify(new users(decodedResult.decoded)));
            
            if(currUser.role.toLowerCase() !== 'admin') {
                res.status(404).json({error: {message: 'User does not have enough access rights to access this function'}});
                return;
            }

            console.log('verified admin success!!');

            req.currUser = currUser;
            next();
        });
    })
}

exports.verifyUserForClient = function(req, res) {
    checkCookies(req, 'userData', function(cookieErr, cookieResult) {
        if(cookieErr) {
            res.status(404).json({verifyError: cookieErr});
            return;
        }
        
        decodeJWT(cookieResult.token, function (decodedErr, decodedResult) {
            if(decodedErr) {
                res.status(404).json({verifyError: decodedErr});
                return;
            }

            const currUser = JSON.parse(JSON.stringify(new users(decodedResult.decoded)));
            const TOS = (currUser.TOS === 1) ? 'COMPLETED' : 'NOTCOMPLETED';
            res.json({result: {type: 'success', userRole: currUser.role, userName: currUser.userName, unit: currUser.unit, TOS: TOS}});
        });
    })
}

exports.logoutServer = function(req, res) {
    if(req.cookies.userData === null || req.cookies.userData === undefined) {
        return;
    }
    
    res.clearCookie('userData');
    res.json({result: {type: 'success'}});
}

function decodeJWT(token, callback) {
    if (!token) {
        callback({ auth: 'failed', message: 'No token provided' }, null);
        return;
    }

    jwt.verify(token, secretBuffer, function (err, decoded) {
        if (err) {
            callback({ auth: 'failed', message: 'Failed to authenticate user' }, null);
            return;
        }
        callback(null, { auth: 'success', decoded: decoded });
    })
}

function sendOneTimePw(user, callback) {
    nexmo.verify.request({
        number: user.contactNo,
        sender_id: 'LEARNet',
        brand: 'LEARNet Login Code',
        code_length: 6,
        pin_expiry: 60,
        next_event_wait: 60
    }, (err, result) => {
        if (err || result.status !== '0') {
            const error = (err === null || undefined) ? result.error_text : err;
            callback(error, null);
            return;
        }
        callback(null, result.request_id);
    });
}

function generateRandomKey() {
    return Math.random().toString(36).slice(-8);
}

function checkCookies(req, checkCookie, callback) {
    //since during the setting of cookies, the cookies are already stringified hence we only require to parse the string to get the object
    let cookiesData = (checkCookie === 'verifyUser') ? req.cookies.verifyUser : req.cookies.userData;

    if(cookiesData === null || cookiesData === undefined) {
        callback({error: {message: "Cookie is not present, please try and login again!"}}, null);
        return;
    }

    cookiesData = JSON.parse(cookiesData);

    callback(null, cookiesData);
}