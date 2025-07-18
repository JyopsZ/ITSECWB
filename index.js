require('dotenv').config();

const multer = require('multer');
const express = require('express')
const bodyParser = require('body-parser')
const session = require("express-session")
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

/*  Importing of Routes From Controller Folder  */
app.use('/', landingRoutes);
app.use('/', studentRoutes);
app.use('/', labtechRoutes);

/* Handlebars */
var hbs = require('hbs')
app.set('view engine','hbs');

var server = app.listen(port, function() {
	console.log("listening to port 3000...");
});