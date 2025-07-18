var express = require('express');
const session = require("express-session");
const bcryptjs = require('bcryptjs');
var router = express.Router();
var path = require('path');
const UserModel = require('../model/user');
const ReservationModel = require('../model/reservation');

const rootDir = path.join(__dirname, '..');

/**************************************** LAB TECHNICIAN ********************************************/
function isAuthenticated(req, res, next) {
    if (req.session.user) {
      return next();
    }
    res.redirect('/login'); // Redirect to login page if not authenticated
  }

// Lab Tech main page
router.get('/labtechView/labtechPage',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/labtechView/labtechPage.html"));
    res.sendFile(path.join(rootDir, 'public', 'labtechView', 'labtechPage.html'));
});

router.get('/labtechView/LViewAvailability',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/labtechView/LViewAvailability.html"));
    res.sendFile(path.join(rootDir, 'public', 'labtechView', 'LViewAvailability.html'));
});

router.get('/labtechView/LSubReservation',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/labtechView/LSubReservation.html"));
    res.sendFile(path.join(rootDir, 'public', 'labtechView', 'LSubReservation.html'));
});

router.get('/labtechView/LSubProfile',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/labtechView/LSubProfile.html"));
    res.sendFile(path.join(rootDir, 'public', 'labtechView', 'LSubProfile.html'));
});


// Lab Tech viewAvailability
router.get('/labtechView/LReserveslot',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/labtechView/LReserveslot.html"));
    res.sendFile(path.join(rootDir, 'public', 'labtechView', 'LReserveslot.html'));
});


// Lab Tech LSubReservation
router.get('/labtechView/LReservation',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/labtechView/LReservation.html"));
    res.sendFile(path.join(rootDir, 'public', 'labtechView', 'LReservation.html'));
});

router.get('/labtechView/LEditReservation',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/labtechView/LEditReservation.html"));
    res.sendFile(path.join(rootDir, 'public', 'labtechView', 'LEditReservation.html'));
});

router.get('/labtechView/LRemoveReservationlist',isAuthenticated, function(req, res) {
    res.sendFile(path.join(rootDir, 'public', 'labtechView', 'LRemoveReservationlist.html'));
});


// Lab Tech LReservation

router.get('/labtechView/lab1',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/labtechView/lab1.html"));
    res.sendFile(path.join(rootDir, 'public', 'labtechView', 'lab1.html'));
});

router.get('/labtechView/lab2',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/labtechView/lab2.html"));
    res.sendFile(path.join(rootDir, 'public', 'labtechView', 'lab2.html'));
});

router.get('/labtechView/lab3',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/labtechView/lab3.html"));
    res.sendFile(path.join(rootDir, 'public', 'labtechView', 'lab3.html'));
});


// Lab Tech LSubProfile
router.get('/labtechView/searchEditProfile',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/labtechView/searchEditProfile.html"));
    res.sendFile(path.join(rootDir, 'public', 'labtechView', 'searchEditProfile.html'));
});

router.get('/labtechView/LsearchOtherProfile',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/labtechView/LsearchOtherProfile.html"));
    res.sendFile(path.join(rootDir, 'public', 'labtechView', 'LsearchOtherProfile.html'));
});


// Lab Tech LViewEditProfile
router.get('/labtechView/LsearchEditProfile',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/labtechView/LsearchEditProfile.html"));
    res.sendFile(path.join(rootDir, 'public', 'labtechView', 'LsearchEditProfile.html'));
});

router.get('/labtechView/LViewOtherProfile',isAuthenticated, function(req, res) {
	//res.sendFile(path.join(__dirname + "\\" + "../public/labtechView/LViewOtherProfile.html"));
    res.sendFile(path.join(rootDir, 'public', 'labtechView', 'LViewOtherProfile.html'));
});


// Labtech Page
router.get("/labtechPage",isAuthenticated, (req, res) => {
    // Retrieve user data from the session
    const user = req.session.user;
    console.log(user);
    res.render('labtechPage',{user});
});

router.get('/LViewEditProfile' ,isAuthenticated, async (req, res) => {
	const userId = req.session.user.userID;
    const userData = await UserModel.find({ userID:userId }) // select * from Post where userID == userData.userID
    console.log(userData)
    res.render('LViewEditProfile',{userData})
});

// editing of user profile with picture
// Handling of form data to database
router.post('/editUserProfileWithImage',isAuthenticated, async (req, res) => {
    try {
        const { userId, firstName, lastName, password } = req.body; // Include userId in the request body

        // Find the user by userID
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

        res.redirect('/labtechPage'); // Adjust this as needed
    } catch (err) {
        console.error('Error updating user information:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Handling of form data to database
router.post('/editInfolabtech',isAuthenticated, async (req, res) => {
    try {
        const { id, firstName, lastName, password } = req.body;

        // Find the user by userID
        const userId = id;
        const user = await UserModel.findOne({ userID: userId });

        // Update the user's information
        user.firstName = firstName;
        user.lastName = lastName;

        const saltRounds = 10;
        const hashedPassword = await bcryptjs.hash(password, saltRounds);
        user.password = hashedPassword;

        // Save the updated user to the database
        await user.save();

        res.redirect('/labtechPage');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle the image upload form submission
router.post('/editImgLabtech',isAuthenticated, async (req, res) => {
    try {

        // Get the uploaded file
        const uploadedFile = req.files.imageUpload;

        // Get the original filename
        const filename = uploadedFile.name;

        // Find the user by userID
        const userId = req.session.user.userID;
        const user = await UserModel.findOne({ userID: userId });

        // Save the uploaded file to the ../public/images folder
        const uploadPath = path.join(__dirname, 'public/images', filename);
        await uploadedFile.mv(uploadPath);

        // Update the user's image property with the original filename
        user.image = filename;

        // Save the updated user to the database
        await user.save();

		req.session.user = {
			
			image: user.image
		}

        // Redirect or send a response
        res.redirect('/labtechPage');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

/* --------------------- EDIT USERS for labtechs ------------------------ */
router.post("/findUser2",isAuthenticated, async (req, res) => {
    try {
        const { userName } = req.body;
        const lowerCaseName = userName.toLowerCase();

        const names = lowerCaseName.trim().split(' ');

        if (names.length !== 2) {
            return res.status(404).redirect('/labtechView/searchEditProfile?error=Please Enter First & Last Name.');
        }

        const filter = {
            $or: [
                { firstName: new RegExp(names[0], 'i'), lastName: new RegExp(names[1], 'i') },
                { firstName: new RegExp(names[1], 'i'), lastName: new RegExp(names[0], 'i') }
            ]
        };

        console.log("Search filter:", filter);

        const users = await UserModel.find(filter);

        console.log("Found users:", users);

        if (users.length === 0) {
            
            return res.status(404).redirect('/labtechView/searchEditProfile?error=User not found.');
        }

        res.render('LViewEditProfile', { userData: users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

/* --------------------- SEARCH USERS for labtechs ------------------------ */
router.post("/viewUserLab",isAuthenticated, async (req, res) => {

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

        res.render('LViewOtherProfile', { userData: users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }

});

/* --------------------- RESERVATION for a student (labtech side) ------------------------ */
router.get('/LReservation',isAuthenticated, function(req, res) {
    res.render('LReservation');
});

// Route to fetch reservations
router.get('/LReservations',isAuthenticated, async (req, res) => {
    const { labName, date, time } = req.query;
    try {
        const LReservations = await ReservationModel.find({ labName, date, time });
        res.json(LReservations);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching reservations');
    }
});

// Route to create a new reservation
router.post('/LReservation',isAuthenticated, async (req, res) => {
    const { labName, seatRow, seatCol, date, time, reserver } = req.body;
    const seatPos = [parseInt(seatRow), parseInt(seatCol)];
    const reservationID = Math.floor(Math.random() * 10000); // Generate a random reservation ID

    try {
        // Check if the seat is already taken
        const existingReserve = await ReservationModel.findOne({ labName, date, time, seatPos });
        if (existingReserve) {
            res.status(500).redirect('/LReservation');
        }

        const newReserve = new ReservationModel({
            labName,
            seatPos,
            date,
            time,
            reserver,
            reservationID
        });

        await newReserve.save();
        res.status(201).redirect('/labtechView/LSubReservation');
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/LReservation');
    }
});

/* --------------------- Edit Reservation for Students ------------------------ */
router.get('/LEditReservation',isAuthenticated, async (req, res) => {
    res.render('LEditReservation');
});

router.post('/LEditReservation',isAuthenticated, async (req, res) => {
    const { reservId } = req.body;
    const specificReserve = await ReservationModel.findOne({ reservationID: reservId });
    console.log(specificReserve);
    res.render('LEditREservation2', {specificReserve});
});

router.post('/updateReservationLab',isAuthenticated, async (req, res) => {
    const { reservationid, editlab, editdate, edittime, editSeat } = req.body;

    const seatPos = editSeat.split(',').map(Number);
    
    // Check if there is an existing reservation with the same lab and date
    const existingReservation = await ReservationModel.findOne({ labName: editlab, date: editdate, time: edittime, seatPos: seatPos });
    
    if (existingReservation) {
        // If there is a clash, inform the user
        return res.render('LEditREservation2', {specificReserve: await ReservationModel.findOne({ reservationID: reservationid }), error: 'The selected date and lab are already reserved.'});
    }
    
    // If no clash, proceed to update the reservation
    const specificReserve = await ReservationModel.findOneAndUpdate(
        { reservationID: reservationid },
        { labName: editlab, date: editdate, time: edittime, seatPos: seatPos }
    );

    console.log(specificReserve);
    res.render('LEditREservation2', {specificReserve, success: 'Reservation updated successfully.'});
});

/* --------------------- Display User Profile from Tooltip Press ------------------------ */
router.post("/tooltipLab",isAuthenticated, async (req, res) => {
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

        res.render('LTooltipViewUser', { userData: users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

/* --------------------- Lab Technician Check Seat Availability ------------------------ */
router.get('/LViewAvailable',isAuthenticated, function(req, res) {
    const user = req.session.user;
    res.render('LViewAvailable');
});

// Route to fetch reservations
router.get('/viewSeatsLab',isAuthenticated, async (req, res) => {
    const { labName, date, time } = req.query;
    try {
        const viewSeatsLab = await ReservationModel.find({ labName, date, time });
        res.json(viewSeatsLab);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching seats');
    }
});

/* --------------------- Delete Reservation ------------------------ */
router.get('/LRemoveReservation',isAuthenticated, async (req, res) => {
    try {
        const getReservations = await ReservationModel.find({});

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

        res.render('LRemoveReservation', { getReservations: formattedReservations });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching reservations');
    }
});

router.delete('/removeReservation/:id',isAuthenticated, async (req, res) => {
    try {
        const reservationId = req.params.id;
        const result = await ReservationModel.findOneAndDelete({ reservationID: reservationId });
        
        if (result) {
            res.json({ success: true, message: 'Reservation removed successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Reservation not found' });
        }
    } catch (error) {
        console.error('Error removing reservation:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;