var express = require('express');
const session = require("express-session");
const bcryptjs = require('bcryptjs');
var router = express.Router();
var path = require('path');
const UserModel = require('../model/user');
const ReservationModel = require('../model/reservation');

const rootDir = path.join(__dirname, '..');

/**************************************** WEB ADMIN ********************************************/
function isAuthenticated(req, res, next) {
    if (req.session.user) {
      return next();
    }
    res.redirect('/login'); // Redirect to login page if not authenticated
  }

//Student studentPage
router.get('/adminView/adminPage', isAuthenticated, function(req, res) {
    res.sendFile(path.join(rootDir, 'public', 'adminView', 'adminPage.html'));
});

module.exports = router;