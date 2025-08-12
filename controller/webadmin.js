var express = require('express');
const session = require("express-session");
const bcryptjs = require('bcryptjs');
var router = express.Router();
var path = require('path');
const User = require('../model/user');
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

router.get('/WcreateLabtechs', isWebadmin, function(req, res) {
  res.render('WcreateLabtechs');
});

router.post('/WcreateLabtechs', isWebadmin, async function(req, res) {
  const { firstName, lastName, email, password, role, question, answer } = req.body;

  const errors = [];

  const minPasswordLength = 8;
  const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

  if (password.length < minPasswordLength) {
    errors.push('Password must be at least 8 characters long.');
    const invalidInput = new InputValidationModel({
      userID: req.session.user.userID,
      field: 'password',
      description: 'Password was less than 8 characters long',
      submittedValue: password
    });
    await invalidInput.save();
  }

  if (!complexityRegex.test(password)) {
    errors.push('Password must include uppercase, lowercase, number, and special character.');
    const invalidInput = new InputValidationModel({
      userID: req.session.user.userID,
      field: 'password',
      description: 'Password did not comply with regex',
      submittedValue: password
    });
    await invalidInput.save();
  }

  if (firstName.length < 2 || firstName.length > 50) {
    errors.push('First name must be between 2 and 50 characters.');
    const invalidInput = new InputValidationModel({
      userID: req.session.user.userID,
      field: 'firstName',
      description: 'Invalid first name length',
      submittedValue: firstName
    });
    await invalidInput.save();
  }

  if (lastName.length < 2 || lastName.length > 50) {
    errors.push('Last name must be between 2 and 50 characters.');
    const invalidInput = new InputValidationModel({
      userID: req.session.user.userID,
      field: 'lastName',
      description: 'Invalid last name length',
      submittedValue: lastName
    });
    await invalidInput.save();
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format.');
    const invalidInput = new InputValidationModel({
      userID: req.session.user.userID,
      field: 'email',
      description: 'Invalid email format, regex failed',
      submittedValue: email
    });
    await invalidInput.save();
  }

  if (email.length < 5 || email.length > 100) {
    errors.push('Email must be between 5 and 100 characters.');
    const invalidInput = new InputValidationModel({
      userID: req.session.user.userID,
      field: 'email',
      description: 'Email was not within the specified length',
      submittedValue: email
    });
    await invalidInput.save();
  }

  if (errors.length > 0) {
    return res.status(400).render('WcreateLabtechs', { errors });
  }

  try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const invalidInput = new InputValidationModel({
                field: 'email',
                description: 'Email already exists',
                submittedValue: email
            });
            await invalidInput.save();
            errors.push('Unable to create account.');
            return res.status(400).render('register', { errors: errors });
        }

        // 2.1.3 – Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcryptjs.hash(password, saltRounds);

        const hashedAnswer = answer ? await bcryptjs.hash(answer.toLowerCase(), saltRounds) : null;

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            securityQuestion: question,
            securityAnswer: hashedAnswer,
            lastPasswordChange: new Date()
        });

        await newUser.save();
        res.render('WadminPage', { message: 'Account created successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/register?error=Server error. Please try again.');
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