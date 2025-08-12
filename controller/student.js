var express = require('express');
const session = require("express-session");
const bcryptjs = require('bcryptjs');
var router = express.Router();
var path = require('path');
const UserModel = require('../model/user');
const ReservationModel = require('../model/reservation');
const InputValidationModel = require('../model/inputValidation');
const AccessControlModel = require('../model/accessControl');
const CriticalLogs = require('../model/criticalLogs');

const rootDir = path.join(__dirname, '..');

function isAuthenticated(req, res, next) {
    if (req.session.user) {
      return next();
    }
    res.redirect('/login'); // Redirect to login page if not authenticated
  }

// Role-based access control middleware for student routes
function isStudent(req, res, next) {
    if (req.session.user && req.session.user.role === 'student') {
        return next();
    }
    // Deny access to lab technicians and other roles - redirect to appropriate page
    if (req.session.user && req.session.user.role === 'labtech') {
        return res.status(403).redirect('/labtechPage?error=Access denied. You do not have permission to access student pages.');
    }
    // If no valid session or unknown role, redirect to login
    return res.status(403).redirect('/login?error=Access denied. Please log in with appropriate credentials.');
}   

function denyLabTechAccess(req, res, next) {
    const deniedPages = [
        '/labtechPage',
        '/LViewAvailability',
        '/LSubReservation', 
        '/LSubProfile',
        '/LReserveslot',
        '/LReservation',
        '/LEditReservation',
        '/LRemoveReservationlist',
        '/LsearchOtherProfile',
        '/LsearchEditProfile',
        '/LViewOtherProfile',
        '/LViewEditProfile',
        '/labtechView' 
    ];
    
    // Check if the requested path matches any denied pages
    const requestedPath = req.path;
    const isDenied = deniedPages.some(deniedPage => 
        requestedPath.includes(deniedPage) || requestedPath === deniedPage
    );
    
    if (isDenied && req.session.user.role === 'student') {
        const accessControlLog = new AccessControlModel({
            userID: req.session.user.userID,
            description: `Student user tried to access labtech page: ${requestedPath}`
        });
        accessControlLog.save();

        return res.status(403).sendFile(path.join(rootDir, 'public', 'errors', '403.html'));
    }
    
    next();
}

function denyWebadminAccess(req, res, next) {
    const deniedPages = [
        '/WadminPage',
        '/dashboard',
        '/dashboard2',
        '/dashboard3'
    ];
    
    // Check if the requested path matches any denied pages
    const requestedPath = req.path;
    const isDenied = deniedPages.some(deniedPage => 
        requestedPath.includes(deniedPage) || requestedPath === deniedPage
    );
    
    if (isDenied && req.session.user.role === 'student') {
        const accessControlLog = new AccessControlModel({
            userID: req.session.user.userID,
            description: `Student user tried to access webadmin page: ${requestedPath}`
        });
        accessControlLog.save();

        return res.status(403).sendFile(path.join(rootDir, 'public', 'errors', '403.html'));
    }
    
    next();
}

router.use(denyLabTechAccess);
router.use(denyWebadminAccess);
  
//Student studentPage
router.get('/studentView/studentPage', isAuthenticated, isStudent, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/studentPage.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'studentPage.html'));
});

router.get('/studentView/view-availability',isAuthenticated, isStudent, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/view-availability.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'view-availability.html'));
});

router.get('/studentView/subReservation',isAuthenticated, isStudent, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/subReservation.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'subReservation.html'));
});

router.get('/studentView/subProfile',isAuthenticated, isStudent, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/subProfile.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'subProfile.html'));
});


//Student subReservation
router.get('/studentView/reservation',isAuthenticated, isStudent, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/reservation.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'reservation.html'));
});

router.get('/studentView/view-list-reservations',isAuthenticated, isStudent, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/view-list-reservations.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'view-list-reservations.html'));
});

router.get('/studentView/edit-reservation',isAuthenticated, isStudent, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/edit-reservation.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'edit-reservation.html'));
});


// Student reservation
router.get('/studentView/reserveslot',isAuthenticated, isStudent, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/reserveslot.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'reserveslot.html'));
});


// Student reserveslot
router.get('/studentView/lab1',isAuthenticated, isStudent, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/lab1.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'lab1.html'));
});

router.get('/studentView/lab2',isAuthenticated, isStudent, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/lab2.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'lab2.html'));
});

router.get('/studentView/lab3',isAuthenticated, isStudent, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/lab3.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'lab3.html'));
});

// Student Page
router.get("/studentPage",isAuthenticated, isStudent, (req, res) => {
    // Retrieve user data from the session
    const user = req.session.user;
    res.render('studentPage',{user});
});

router.get('/studentView/searchOtherProfile',isAuthenticated, isStudent, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/searchOtherProfile.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'searchOtherProfile.html'));
});

router.get('/studentView/DeleteProfile',isAuthenticated, isStudent, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/DeleteProfile.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'DeleteProfile.html'));
});

// Student serchOtherProfile
router.get('/studentView/ViewOtherProfile',isAuthenticated, isStudent, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/ViewOtherProfile.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'ViewOtherProfile.html'));
});


// Student ViewEdit Handlebar
// Route for Handlebar
router.get('/ViewEditProfile' ,isAuthenticated, isStudent, async (req, res) => {
    const userId = req.session.user.userID;
    const userData = await UserModel.find({ userID:userId }) // select * from Post where userID == userData.userID
    res.render('ViewEditProfile',{userData})
});

// Handling of form data to database
router.post('/editInfo', isAuthenticated, async (req, res) => {
    try {
        const { firstName, lastName, password } = req.body;

        const userId = req.session.user.userID;
        const user = await UserModel.findOne({ userID: userId });

        if (!user) {
            return res.status(404).send('User not found');
        }

        user.firstName = firstName;
        user.lastName = lastName;

        const errors = [];

        // 2.3.2 – Validate first name length (should be between 2 to 50 characters)
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

        // 2.3.2 – Validate last name length (should be between 2 to 50 characters)
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

        // 2.1.5 & 2.1.6 – Enforce password length and complexity
        if (password) {
            const minLength = 8;
            const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

            if (password.length < minLength) {
                errors.push('Password must be at least 8 characters long.');
                const invalidInput = new InputValidationModel({
                    userID: req.session.user.userID,
                    field: 'password',
                    description: 'Invalid password length',
                    submittedValue: password
                });
                await invalidInput.save();
            }

            if (!complexityRegex.test(password)) {
                errors.push('Password must include uppercase, lowercase, number, and special character.');
                const invalidInput = new InputValidationModel({
                    userID: req.session.user.userID,
                    field: 'password',
                    description: 'Invalid password complexity',
                    submittedValue: password
                });
                await invalidInput.save();
            }

            // 2.1.3 – Hash the password
            if (errors.length === 0) {
                const saltRounds = 10;
                const hashedPassword = await bcryptjs.hash(password, saltRounds);
                user.password = hashedPassword;
            }
        }

        if (errors.length > 0) {
            const criticalLog = new CriticalLogs({ // Log failed account edit change
                userID: user.userID,
                field: 'Account',
                operation: 'Edit',
                status: 'failed',
                description: 'Account change failed due to validation errors'
            });
            await criticalLog.save();

            return res.status(400).render('ViewEditProfile', {
                userData: [user],
                errors
            });
        }

        await user.save();

        req.session.user = {
            userID: user.userID,
            firstName: user.firstName,
            lastName: user.lastName,
            password: user.password,
            email: user.email,
            role: user.role
        };

        const criticalLog = new CriticalLogs({ // Log successful account edit
            userID: user.userID,
            field: 'Account',
            operation: 'Edit',
            status: 'success',
            description: 'Account Editted successfully'
        });
        await criticalLog.save();

        res.redirect('/studentPage');
    } catch (err) {
        console.error('Error updating user information:', err);
        res.status(500).send('Internal Server Error');
    }
});


/*
// Route to handle the image upload form submission
router.post('/editImg', async (req, res) => {
    try {
        if (!req.files || !req.files.imageUpload) {
            return res.status(400).send('No files were uploaded.');
        }   
        else{
            // Get the uploaded file
            const uploadedFile = req.files.imageUpload;

            // Get the original filename
            const filename = uploadedFile.name;

            // Find the user by userID
            const userId = req.session.user.userID;
            const user = await UserModel.findOne({ userID: userId });

            // Save the uploaded file to the ../public/images folder
            const uploadPath = path.join(__dirname, '../public/images', filename);
            await uploadedFile.mv(uploadPath);

            // Update the user's image property with the original filename
            user.image = filename;

            // Save the updated user to the database
            await user.save();

            // Update session with the new image path
            req.session.user.image = user.image;

            // Redirect or send a response
            res.redirect('/studentPage');
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});*/

/* --------------------- SEARCH USERS for students ------------------------ */
router.post("/findUser",isAuthenticated, isStudent, async (req, res) => {
    try {
        const { userName } = req.body;
        const lowerCaseName = userName.toLowerCase();

        let filter = {};

        const names = lowerCaseName.trim().split(' ');
        
        if (names.length === 2) {
            filter = {
                $or: [
                    { firstName: new RegExp(names[0], 'i'), lastName: new RegExp(names[1], 'i') },
                    { firstName: new RegExp(names[1], 'i'), lastName: new RegExp(names[0], 'i') }
                ]
            };
        } else if (names.length === 1) {
            filter = {
                $or: [
                    { firstName: new RegExp(names[0], 'i') },
                    { lastName: new RegExp(names[0], 'i') }
                ]
            };
        }

        const users = await UserModel.find(filter);

        res.render('searchOtherProfile', { userData: users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

/* --------------------- Student RESERVATION ------------------------ */
router.get('/reservation',isAuthenticated, isStudent, function(req, res) {
    const user = req.session.user;
    res.render('reservation', {
        firstName: user.firstName,
        lastName: user.lastName
    });
});

// Route to fetch reservations
router.get('/reservations',isAuthenticated, isStudent, async (req, res) => {
    const { labName, date, time } = req.query;
    try {
        const reservations = await ReservationModel.find({ labName, date, time });
        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching reservations');
    }
});

// Route to create a new reservation
router.post('/reservation', isAuthenticated, isStudent, async (req, res) => {
    const { labName, seatRow, seatCol, date, time, reserver } = req.body;
    const seatPos = [parseInt(seatRow), parseInt(seatCol)];

    try {
        // Check if the seat is already taken
        const existingReserve = await ReservationModel.findOne({ labName, date, time, seatPos });
        if (existingReserve) {
            return res.status(500).redirect('/reservation');
        }


        const newReserve = new ReservationModel({
            labName,
            seatPos,
            date,
            time,
            reserver
        });

        await newReserve.save();
        res.status(201).redirect('/studentView/subReservation');
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/reservation');
    }
});


/* --------------------- Edit Reservation for Students ------------------------ */
router.get('/view-list-reservations',isAuthenticated, isStudent, async (req, res) => {
    const getSessionUID = req.session.user.userID;
    const getUserID = await UserModel.findOne({ userID: getSessionUID });
    const firstName = getUserID.firstName;
    const lastName = getUserID.lastName;
    const fullName = `${firstName} ${lastName}`;
    const getReservations = await ReservationModel.find({ reserver: fullName });

    const formattedReservations = getReservations.map(reservation => {
        let labName = reservation.labName;
        if (labName === "lab1") labName = "Lab Alpha";
        else if (labName === "lab2") labName = "Lab Beta";
        else if (labName === "lab3") labName = "Lab Charlie";

        let time = reservation.time;
        if (time === "nine") time = "9:00 - 9:30 AM";
        else if (time === "nineThirty") time = "9:30 - 10:00 AM";
        else if (time === "ten") time = "10:00 - 10:30 AM";

        return { ...reservation.toObject(), labName, time };
    });

    res.render('view-list-reservations', { getReservations: formattedReservations });
});

router.get('/editReservation',isAuthenticated, isStudent, async (req, res) => {
    res.render('editReservation');
});

router.post('/editReservation',isAuthenticated, isStudent, async (req, res) => {
    const { reservId } = req.body;
    const userID = req.session.user.userID;

    const user = await UserModel.findOne({ userID: userID }); // get user data from database
    const fullName = `${user.firstName} ${user.lastName}`;

    try {
        const specificReserve = await ReservationModel.findOne({ reservationID: reservId }); // get reservation data from database
        
        if (!specificReserve) {
            // Log invalid input for non-existing reservation ID
            const invalidInput = new InputValidationModel({
                userID,
                field: 'reservationID',
                description: 'Attempted to edit non-existing reservation ID',
                submittedValue: reservId
            });
            await invalidInput.save();
            
            return res.render('editReservation', { error: 'Invalid reservation ID. Please try again.' });
        }
        
        if (specificReserve.reserver !== fullName) {
            // Log access control violation for accessing other user's reservation
            const accessViolation = new AccessControlModel({
                userID,
                description: 'Attempted to edit reservation belonging to another user'
            });
            await accessViolation.save();
            
            return res.render('editReservation', { error: 'Invalid reservation ID. Please try again.' });
        }
        
        res.render('EditReservation2', {specificReserve});
    } catch (error) {
        console.error('Error in editReservation:', error);
        res.status(500).render('editReservation', { error: 'Server error occurred.' });
    }
});

router.post('/updateReservation',isAuthenticated, isStudent, async (req, res) => {
    const { reservationid, editlab, editdate, edittime, editSeat } = req.body;
    const userID = req.session.user.userID;

    const seatPos = editSeat.split(',').map(Number);
    
    // Check if there is an existing reservation with the same lab and date
    const existingReservation = await ReservationModel.findOne({ labName: editlab, date: editdate, time: edittime, seatPos: seatPos });
    
    if (existingReservation) {

        // Log invalid input for conflicting reservation
        const invalidInput = new InputValidationModel({
            userID,
            field: 'reservationConflict',
            description: 'Attempted to update reservation to an already occupied seat',
            submittedValue: `${editlab}, ${editdate}, ${edittime}, ${editSeat}`
        });
        await invalidInput.save();

        // If there is a clash, inform the user
        return res.render('EditReservation2', {specificReserve: await ReservationModel.findOne({ reservationID: reservationid }), error: 'The selected date and lab are already reserved.'});
    }
    
    // If no clash, proceed to update the reservation
    const specificReserve = await ReservationModel.findOneAndUpdate(
        { reservationID: reservationid },
        { labName: editlab, date: editdate, time: edittime, seatPos: seatPos }
    );

    res.render('EditReservation2', {specificReserve, success: 'Reservation updated successfully.'});
});


/* --------------------- Delete own Profile for Students ------------------------ */
router.post('/deleteUser',isAuthenticated, isStudent, async (req, res) => {
    try {
        const userId = req.session.user.userID;
        const user = await UserModel.findOne({ userID: userId });
        const fullName = `${user.firstName} ${user.lastName}`;

        // Delete the user
        await UserModel.deleteOne({ userID: userId });

        // Delete associated reservations
        await ReservationModel.deleteMany({ reserver: fullName });

        const criticalLogSuccess = new CriticalLogs({ // Log successful account deletion
            userID: user.userID,
            field: 'Account',
            operation: 'Delete',
            status: 'success',
            description: 'User successfully deleted their own account',
            timestamp: new Date()
        });
        await criticalLogSuccess.save();

        req.session.destroy();
        res.redirect('/');
    } catch (err) {

        const criticalLogFailed = new CriticalLogs({ // Log failed account deletion
            userID: req.session.user.userID,
            field: 'Account',
            operation: 'Delete',
            status: 'failed',
            description: 'User failed to delete their own account',
            timestamp: new Date()
        });
        await criticalLogFailed.save();

        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
/* --------------------- Display User Profile from Tooltip Press ------------------------ */
router.post("/tooltip",isAuthenticated, isStudent, async (req, res) => {
    try {
        const { userName } = req.body;
        const lowerCaseName = userName.toLowerCase();

        let filter = {};

        const names = lowerCaseName.trim().split(' ');
        
        if (names.length === 2) {
            filter = {
                $or: [
                    { firstName: new RegExp(names[0], 'i'), lastName: new RegExp(names[1], 'i') },
                    { firstName: new RegExp(names[1], 'i'), lastName: new RegExp(names[0], 'i') }
                ]
            };
        } else if (names.length === 1) {
            filter = {
                $or: [
                    { firstName: new RegExp(names[0], 'i') },
                    { lastName: new RegExp(names[0], 'i') }
                ]
            };
        }

        const users = await UserModel.find(filter);

        res.render('tooltipViewUser', { userData: users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


/* --------------------- Student Check Seat Availability ------------------------ */
router.get('/viewAvailable',isAuthenticated, isStudent, function(req, res) {
    const user = req.session.user;
    res.render('viewAvailable', {user: user});
});

// Route to fetch reservations
router.get('/viewSeats', isStudent, async (req, res) => {
    const { labName, date, time } = req.query;
    try {
        const viewSeats = await ReservationModel.find({ labName, date, time });
        res.json(viewSeats);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching seats');
    }
});

/* --------------------- Logging ------------------------ */
// route for logging invalid inputs, userID is taken from session, the rest are supplied by specific input fields.
router.post('/logInvalidInput', isAuthenticated, async (req, res) => { 
    try {
        const { field, description, submittedValue } = req.body;
        const userID = req.session.user.userID; // current userID

        const invalidInput = new InputValidationModel({
            userID,
            field,
            description,
            submittedValue
        });

        await invalidInput.save();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error logging invalid input:', error);
        res.status(500).json({ error: 'Failed to log invalid input' });
    }
});

module.exports = router;