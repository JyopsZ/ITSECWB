var express = require('express');
const session = require("express-session");
const bcryptjs = require('bcryptjs');
var router = express.Router();
var path = require('path');
const UserModel = require('../model/user');
const ReservationModel = require('../model/reservation');
const InputValidationModel = require('../model/inputValidation');
const AccessControlModel = require('../model/accessControl');
const AuthAttemptsModel = require('../model/authAttempts');

const rootDir = path.join(__dirname, '..');

/**************************************** WEB ADMIN ********************************************/
function isAuthenticated(req, res, next) {
    if (req.session.user) {
      return next();
    }
    res.redirect('/login'); // Redirect to login page if not authenticated
  }

  router.get('/WadminPage', isAuthenticated, (req, res) => {
    res.render('WadminPage');
  });

// Route to display dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const accessControlLogs = await AccessControlModel.find().sort({ timestamp: -1 });

    res.render('dashboard', {
      accessControlLogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching logs');
  }
});

router.get('/dashboard2', isAuthenticated, async (req, res) => {
  try {
    const authAttemptsLogs = await AuthAttemptsModel.find().sort({ timestamp: -1 });

    res.render('dashboard2', {
      authAttemptsLogs
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching logs');
  }
});

router.get('/dashboard3', isAuthenticated, async (req, res) => {
  try {
    const inputValidationLogs = await InputValidationModel.find().sort({ timestamp: -1 });

    res.render('dashboard3', {
      inputValidationLogs
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching logs');
  }
});


module.exports = router;