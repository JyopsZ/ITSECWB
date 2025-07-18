var express = require('express');
const session = require("express-session");
const bcryptjs = require('bcryptjs');
var router = express.Router();
var path = require('path');
const UserModel = require('../model/user');
const ReservationModel = require('../model/reservation');

const rootDir = path.join(__dirname, '..');

function isAuthenticated(req, res, next) {
    if (req.session.user) {
      return next();
    }
    res.redirect('/login'); // Redirect to login page if not authenticated
  }
  
//Student studentPage
router.get('/studentView/studentPage', isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/studentPage.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'studentPage.html'));
});

router.get('/studentView/view-availability',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/view-availability.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'view-availability.html'));
});

router.get('/studentView/subReservation',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/subReservation.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'subReservation.html'));
});

router.get('/studentView/subProfile',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/subProfile.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'subProfile.html'));
});


//Student subReservation
router.get('/studentView/reservation',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/reservation.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'reservation.html'));
});

router.get('/studentView/view-list-reservations',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/view-list-reservations.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'view-list-reservations.html'));
});

router.get('/studentView/edit-reservation',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/edit-reservation.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'edit-reservation.html'));
});


// Student reservation
router.get('/studentView/reserveslot',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/reserveslot.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'reserveslot.html'));
});


// Student reserveslot
router.get('/studentView/lab1',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/lab1.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'lab1.html'));
});

router.get('/studentView/lab2',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/lab2.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'lab2.html'));
});

router.get('/studentView/lab3',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/lab3.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'lab3.html'));
});

// Student Page
router.get("/studentPage",isAuthenticated, (req, res) => {
    // Retrieve user data from the session
    const user = req.session.user;
    console.log(user);
    res.render('studentPage',{user});
});


// Student subProfile
/*
router.get('/studentView/ViewEditProfile' , async (req, res) => {
	const userId = req.session.userID;
    const userData = await UserModel.find({userID:userId}) // select * from Post where userID == userData.userID
    console.log(userData)
    res.render('ViewEditProfile',{userData})
});
*/ 

router.get('/studentView/searchOtherProfile',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/searchOtherProfile.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'searchOtherProfile.html'));
});

router.get('/studentView/DeleteProfile',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/DeleteProfile.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'DeleteProfile.html'));
});

// Student serchOtherProfile
router.get('/studentView/ViewOtherProfile',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/studentView/ViewOtherProfile.html"));
    res.sendFile(path.join(rootDir, 'public', 'studentView', 'ViewOtherProfile.html'));
});


// Student ViewEdit Handlebar
// Route for Handlebar
router.get('/ViewEditProfile' ,isAuthenticated, async (req, res) => {
    const userId = req.session.user.userID;
    const userData = await UserModel.find({ userID:userId }) // select * from Post where userID == userData.userID
    console.log(userData)
    res.render('ViewEditProfile',{userData})
});

// Handling of form data to database
router.post('/editInfo',isAuthenticated, async (req, res) => {
    try {
        const { firstName, lastName, password } = req.body;

        // Find the user by userID
        const userId = req.session.user.userID;
        const user = await UserModel.findOne({ userID: userId });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Update the user's information
        user.firstName = firstName;
        user.lastName = lastName;

        const saltRounds = 10;
        const hashedPassword = await bcryptjs.hash(password, saltRounds);
        user.password = hashedPassword;

        if (req.files && req.files.imageUpload) {
            const imageFile = req.files.imageUpload;
            //const uploadPath = path.join(__dirname, '../public/images', `${Date.now()}-${imageFile.name}`);
            const uploadPath = path.join(rootDir, 'public', 'images', `${Date.now()}-${imageFile.name}`);
            
            // Move the file to the desired location
            imageFile.mv(uploadPath, (err) => {
                if (err) {
                    console.error('Error uploading file:', err);
                    return res.status(500).send('Internal Server Error');
                }
            });

            user.image = path.basename(uploadPath); // Store the filename of the uploaded image
        }

        // Save the updated user to the database
        await user.save();

        // Update the session data with the new user information
        req.session.user = {
            userID: user.userID,
            firstName: user.firstName,
            lastName: user.lastName,
            password: user.password,
            image: user.image
        };

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
router.post("/findUser",isAuthenticated, async (req, res) => {
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

        console.log("Search filter:", filter);

        const users = await UserModel.find(filter);

        console.log("Found users:", users);

        res.render('searchOtherProfile', { userData: users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

/* --------------------- Student RESERVATION ------------------------ */
router.get('/reservation',isAuthenticated, function(req, res) {
    const user = req.session.user;
    res.render('reservation', {
        firstName: user.firstName,
        lastName: user.lastName
    });
});

// Route to fetch reservations
router.get('/reservations',isAuthenticated, async (req, res) => {
    const { labName, date, time } = req.query;
    try {
        const reservations = await ReservationModel.find({ labName, date, time });
        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching reservations');
    }
});

let reservationIDCounter = 1018;

// Route to create a new reservation
router.post('/reservation', isAuthenticated, async (req, res) => {
    const { labName, seatRow, seatCol, date, time, reserver } = req.body;
    const seatPos = [parseInt(seatRow), parseInt(seatCol)];

    try {
        // Check if the seat is already taken
        const existingReserve = await ReservationModel.findOne({ labName, date, time, seatPos });
        if (existingReserve) {
            return res.status(500).redirect('/reservation');
        }

        const reservationID = reservationIDCounter++;

        const newReserve = new ReservationModel({
            labName,
            seatPos,
            date,
            time,
            reserver,
            reservationID
        });

        await newReserve.save();
        res.status(201).redirect('/studentView/subReservation');
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/reservation');
    }
});


/* --------------------- Edit Reservation for Students ------------------------ */
router.get('/view-list-reservations',isAuthenticated, async (req, res) => {
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

router.get('/editReservation',isAuthenticated, async (req, res) => {
    res.render('editReservation');
});

router.post('/editReservation',isAuthenticated, async (req, res) => {
    const { reservId } = req.body;
    const specificReserve = await ReservationModel.findOne({ reservationID: reservId });
    console.log(specificReserve);
    res.render('EditReservation2', {specificReserve});
});

router.post('/updateReservation',isAuthenticated, async (req, res) => {
    const { reservationid, editlab, editdate, edittime, editSeat } = req.body;

    const seatPos = editSeat.split(',').map(Number);
    
    // Check if there is an existing reservation with the same lab and date
    const existingReservation = await ReservationModel.findOne({ labName: editlab, date: editdate, time: edittime, seatPos: seatPos });
    
    if (existingReservation) {
        // If there is a clash, inform the user
        return res.render('EditReservation2', {specificReserve: await ReservationModel.findOne({ reservationID: reservationid }), error: 'The selected date and lab are already reserved.'});
    }
    
    // If no clash, proceed to update the reservation
    const specificReserve = await ReservationModel.findOneAndUpdate(
        { reservationID: reservationid },
        { labName: editlab, date: editdate, time: edittime, seatPos: seatPos }
    );

    console.log(specificReserve);
    res.render('EditReservation2', {specificReserve, success: 'Reservation updated successfully.'});
});


/* --------------------- Delete own Profile for Students ------------------------ */
router.post('/deleteUser',isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.userID;
        const user = await UserModel.findOne({ userID: userId });
        const fullName = `${user.firstName} ${user.lastName}`;

        // Delete the user
        await UserModel.deleteOne({ userID: userId });

        // Delete associated reservations
        await ReservationModel.deleteMany({ reserver: fullName });

        req.session.destroy();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
/* --------------------- Display User Profile from Tooltip Press ------------------------ */
router.post("/tooltip",isAuthenticated, async (req, res) => {
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

        console.log("Search filter:", filter);

        const users = await UserModel.find(filter);

        console.log("Found users:", users);

        res.render('tooltipViewUser', { userData: users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


/* --------------------- Student Check Seat Availability ------------------------ */
router.get('/viewAvailable',isAuthenticated, function(req, res) {
    const user = req.session.user;
    res.render('viewAvailable');
});

// Route to fetch reservations
router.get('/viewSeats', async (req, res) => {
    const { labName, date, time } = req.query;
    try {
        const viewSeats = await ReservationModel.find({ labName, date, time });
        res.json(viewSeats);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching seats');
    }
});

module.exports = router;