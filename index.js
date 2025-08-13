require('dotenv').config();

const multer = require('multer');
const express = require('express')
const bodyParser = require('body-parser')
const session = require("express-session")
const MemoryStore = require('memorystore')(session)
const path = require('path')

const { envPort, dbURL, sessionKey } = require("./config");

const options = {
    useNewUrlParser: true
};

const mongoose = require('mongoose')
mongoose.connect(dbURL)

// File Uploading
const fileUpload = require('express-fileupload')

const app = new express();

const port = envPort || 3000;

/* Initialize database collections */
const Reservation = require("./model/reservation")
const Profile = require("./model/profile")
const User = require("./model/user")
const PasswordHistory = require("./model/password")

const InputValidation = require("./model/inputValidation")
const AuthAttempts = require("./model/authAttempts")
const AccessControl = require("./model/accessControl")
const CriticalLogs = require("./model/criticalLogs")

app.use(express.json()) // use json
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//app.use(express.static(__dirname)); // legacy code in case of emergency

app.use(express.json());
app.use(fileUpload());


// Session middleware setup
app.use(
    session({
        secret: sessionKey,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 86400000 },
        store: new MemoryStore({
            checkPeriod: 86400000 // prune expired entries every 24h
        }),
    })
);

app.use(express.static(path.join(__dirname + "/public"))); 

const userRoutes = require('./controller/student');
app.use('/user', userRoutes);

const userRoutesLab = require('./controller/labtech');
app.use('/user', userRoutesLab);

/*  Importing of Routes From Controller Folder  */
const landingRoutes = require('./controller/landing')
const studentRoutes = require('./controller/student')
const labtechRoutes = require('./controller/labtech')
const webadminRoutes = require('./controller/webadmin')

/*  Importing of Routes From Controller Folder  */
app.use('/', landingRoutes);
app.use('/', studentRoutes);
app.use('/', labtechRoutes);
app.use('/', webadminRoutes);

/* Handlebars */
var hbs = require('hbs')
app.set('view engine','hbs');

const moment = require('moment-timezone');

hbs.registerHelper('formatTimestamp', function(timestamp) {
    return moment(timestamp).subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss');
});

//console.log('NODE_ENV:', process.env.NODE_ENV); // show production mode

var server = app.listen(port, function() {
	console.log("listening to port 3000...");
});

const rootDir = __dirname;

// Catch-all for unmatched routes (404)
app.use((req, res) => {
  res.status(404).sendFile(path.join(rootDir, 'public', 'errors', '404.html'));
});