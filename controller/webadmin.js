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

  // controller/webadmin.js
function isWebadmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'webadmin') {
    return next();
  }

  // If no valid session or unknown role, redirect to login
  return res.status(403).redirect('/login?error=Access denied. Please log in with appropriate credentials.');
}


  router.get('/WadminPage', isAuthenticated, isWebadmin, (req, res) => {
    res.render('WadminPage');
  });

// Route to display dashboard
router.get('/dashboard', isAuthenticated, isWebadmin, async (req, res) => {
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

router.get('/dashboard2', isAuthenticated, isWebadmin, async (req, res) => {
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

router.get('/dashboard3', isAuthenticated, isWebadmin, async (req, res) => {
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

router.all(['/WadminPage', '/dashboard', '/dashboard2', '/dashboard3'], (req, res, next) => {
    if (req.session.user.role === 'student' || req.session.user.role === 'labtech') {
        /*
        const accessControlLog = new AccessControlModel({
            userID: req.session.user.userID,
            description: `Unauthorized user tried to access webadmin page: ${req.path}`
        });
        accessControlLog.save();
        */
        
        return res.status(403).redirect('/403');
    }
});


module.exports = router;