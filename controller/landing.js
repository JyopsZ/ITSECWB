var express = require('express');
const bcryptjs = require('bcryptjs');
var router = express.Router();
var path = require('path');
const User = require('../model/user');

const rootDir = path.join(__dirname, '..');

router.get('/index', function(req, res) {
    res.sendFile(path.join(rootDir, 'public', 'index.html'));
	//res.sendFile(path.join(__dirname + "\\" + "../public/index.html"));
});

router.get('/login', function(req, res) {
    res.sendFile(path.join(rootDir, 'public', 'login.html'));
	//res.sendFile(path.join(__dirname + "\\" + "../public/login.html"));
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).redirect('/login?error=User not found. Please register.');
        }

        // Compare the hashed password with the plain text password
        const isMatch = await bcryptjs.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).redirect('/login?error=Invalid credentials');
        }

        // Store user data in session
        req.session.user = user;

        // Redirect based on user role
        switch (user.role) {
            case 'student':
                res.render('studentPage', { user }); // Redirect to student dashboard or main page
                break;
            case 'labtech':
                res.render('labtechPage', { user }); // Redirect to lab technician dashboard or main page
                break;
            default:
                res.status(403).send('Unauthorized access');
        }
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/login?error=Server error');
    }
});

router.get('/register', function(req, res) {
    res.sendFile(path.join(rootDir, 'public', 'register.html'));
	//res.sendFile(path.join(__dirname + "\\" + "../public/register.html"));
});

let userIDCounter = 5013;

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email already exists');
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcryptjs.hash(password, saltRounds);

        const userID = userIDCounter++;

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            userID
        });

        await newUser.save();
        res.status(201).redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/register');
    }
});

module.exports = router;

router.get("/logout", (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Could not log out.");
        }

        // Clear the cookie (ensure the cookie name matches the one used)
        res.clearCookie("connect.sid", { path: '/' }); // Assuming default cookie name is 'connect.sid'

        // Redirect to the login page
        res.redirect("/login");
    });
});

router.get('/AboutMe', function(req, res) {
    res.sendFile(path.join(rootDir, 'public', 'AboutMe.html'));
	//res.sendFile(path.join(__dirname + "\\" + "../public/AboutMe.html"));
});


module.exports = router;