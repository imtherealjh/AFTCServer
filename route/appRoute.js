const express = require('express');
const router = express.Router();

const bookingController = require('../controller/bookingController');
const userController = require('../controller/userController');
const inventoryController = require('../controller/inventoryController');
const logsController = require('../controller/loggerController');

const {check, param} = require('express-validator/check');
const {sanitizeParam, sanitizeBody} = require('express-validator/filter');

//start of admin functions
router.route('/booking/allupcoming')
.get(
    //get all bookings are only for admin
    userController.verifyAdmin,
    bookingController.getUpcomingBooking);

router.route('/user')
.post(
    userController.verifyAdmin,
    [check('userName').not().isEmpty().withMessage("Start date cannot be empty"),
    check('contactNo').not().isEmpty().withMessage("End date cannot be empty"),
    check('courseName').not().isEmpty().withMessage("Course Name cannot be empty"),
    check('tabletNo').not().isEmpty().withMessage("Number of tablet cannot be empty"),
    sanitizeBody('*').trim().escape()],
    userController.createUser
)
//end of admin functions

//start of function finished testing
router.route('/user')
.get(
    [check('userName').not().isEmpty().withMessage("Username is required"),
    sanitizeBody('*').trim().escape()],
    userController.Login);

router.route('/user/verifyOTP')
.post(
    [check('code').not().isEmpty().withMessage("Code is Required"),
    sanitizeBody('*').trim().escape()],
    userController.Verification);

 router.route('/user/updateTOS')
.put(userController.verifyUser,
    userController.updateTermsNCond);
//end of function finished testing

//function for everyone
router.route('/booking/getDataByUser')
.get(userController.verifyUser,
    bookingController.getBookingsByUser);

router.route('/booking')
.post(
    userController.verifyUser,
    [check('startDate').not().isEmpty().withMessage("Start date cannot be empty"),
    check('endDate').not().isEmpty().withMessage("End date cannot be empty"),
    check('courseName').not().isEmpty().withMessage("Course Name cannot be empty"),
    check('tabletNo').not().isEmpty().withMessage("Number of tablet cannot be empty"),
    sanitizeBody('*').trim().escape()],
    bookingController.addBooking);

router.route('/booking/:id')
.get(
    userController.verifyUser,
    [param('id').not().isEmpty().withMessage("Params is required"),
    sanitizeParam('id').trim().escape()],
    bookingController.getBookingsById)
.put(
    userController.verifyUser,
    [param('id').not().isEmpty().withMessage("Params is required"),
    check('courseName').not().isEmpty().withMessage("Course Name cannot be empty"),
    check('tabletNo').not().isEmpty().withMessage("Number of tablet cannot be empty"),
    sanitizeParam('id').trim().escape(),
    sanitizeBody('*').trim().escape()],
    bookingController.updateBookingDetails);

router.route('/extendBooking/:id')
.put(
    userController.verifyUser,
    [param('id').not().isEmpty().withMessage("Params is required"),
    check('startDate').not().isEmpty().withMessage("Start Date cannot be empty"),
    check('endDate').not().isEmpty().withMessage("End Date cannot be empty"),
    sanitizeParam('id').trim().escape(),
    sanitizeBody('*').trim().escape()],
    bookingController.extendBooking
);

router.route('/overwriteBooking/:id')
.put(userController.verifyAdmin,
    [param('id').not().isEmpty().withMessage("Params is required"),
    check('courseName').not().isEmpty().withMessage("Course Name cannot be empty"),
    check('startDate').not().isEmpty().withMessage("Start Date cannot be empty"),
    check('endDate').not().isEmpty().withMessage("End Date cannot be empty"),
    check('tabletNo').not().isEmpty().withMessage("Number of tablet cannot be empty"),
    sanitizeParam('id').trim().escape(),
    sanitizeBody('*').trim().escape()],
    bookingController.overwriteBooking
);

router.route('/user/checkCookies')
.get(userController.verifyUserForClient);

router.route('/inventory')
.get(inventoryController.getInventory)
.post(inventoryController.updateInventory);

router.route('/returnTablets')
.put(userController.verifyAdmin,
    [check('id').not().isEmpty().withMessage("Booking id cannot be empty"),
    check('returnTablets').not().isEmpty().withMessage("Returned Tablets cannot be empty"),
    sanitizeBody('*').trim().escape()],
    bookingController.returnTablets);

router.route('/logs')
.get(logsController.getAllLogs);

router.route('/logs/create')
.post(logsController.createNewBookingLog);

router.route('/inventory/stats')
.get(inventoryController.getLastRecordInventory);

router.route('/logout').get(userController.logoutServer);

module.exports = router;
