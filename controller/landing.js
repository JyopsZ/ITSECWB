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
    const { email, password } = req.body; // get data from form

    try {
        const user = await User.findOne({ email }); // check list of emails in db then display user not found error (Fix kase vulnerability, make general)

        if (!user) {
            return res.status(401).redirect('/login?error=Invalid username and/or password.');
        }

        // Check if account is currently locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(403).redirect('/login?error=Account is temporarily locked. Please try again later.');
        }

        const isMatch = await bcryptjs.compare(password, user.password);

        const MAX_ATTEMPTS = 3; //change this to increase or decrease number of attempts

        if (!isMatch) {
            user.failedLoginAttempts += 1;

            if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
                user.lockUntil = new Date(Date.now() + 1 * 60 * 1000); // 1 min lockout for testing
                // user.lockUntil = new Date(Date.now() + 60 * 60 * 1000); // 1-hour lock for final 
                user.failedLoginAttempts = 0;
                await user.save();
                return res.status(403).redirect('/login?error=Too many failed attempts. Account locked.');
            }

            await user.save();
            return res.status(401).redirect('/login?error=Invalid username and/or password.');
        }

        //  Successful login: reset counters
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        req.session.user = user;

        switch (user.role) {
            case 'student':
                return res.render('studentPage', { user });
            case 'labtech':
                return res.render('labtechPage', { user });
            default:
                return res.status(403).send('Unauthorized access');
        }

    } catch (error) {
        console.error(error);
        return res.status(500).redirect('/login?error=Server error');
    }
});


router.get('/register', function(req, res) {
    res.sendFile(path.join(rootDir, 'public', 'register.html'));
	//res.sendFile(path.join(__dirname + "\\" + "../public/register.html"));
});

let userIDCounter = 5021;

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    // 2.1.5 & 2.1.6 – Enforce password length and complexity
    const minPasswordLength = 8;
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

    if (password.length < minPasswordLength) {
        return res.status(400).redirect('/register?error=Password must be at least 8 characters long.');
    }

    if (!complexityRegex.test(password)) {
        return res.status(400).redirect('/register?error=Password must include uppercase, lowercase, number, and special character.');
    }

    // 2.3.2 – Validate first name length (should be between 2 to 50 characters)
    if (firstName.length < 2 || firstName.length > 50) {
        return res.status(400).redirect('/register?error=First name must be between 2 and 50 characters.');
    }

    // 2.3.2 – Validate last name length (should be between 2 to 50 characters)
    if (lastName.length < 2 || lastName.length > 50) {
        return res.status(400).redirect('/register?error=Last name must be between 2 and 50 characters.');
    }

    // 2.3.2 - Validate Email Data Range
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).redirect('/register?error=Invalid email format.');
    }

    // 2.3.3 – Validate email length (should be between 5 to 100 characters)
    if (email.length < 5 || email.length > 100) {
        return res.status(400).redirect('/register?error=Email must be between 5 and 100 characters.');
    }

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).redirect('/register?error=Email already exists.');
        }

        // 2.1.3 – Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcryptjs.hash(password, saltRounds);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();
        res.status(201).redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/register?error=Server error. Please try again.');
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

router.get('/passwordreset', function(req, res) {
    res.sendFile(path.join(rootDir, 'public', 'passwordreset.html'));
});

router.post('/passwordreset', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).redirect('/passwordreset?error=Email not found.');
        }
        res.status(200).render('../views/SecurityQuestions');
    } catch (error) {
        console.error(error);
        return res.status(500).redirect('/passwordreset?error=Server error. Please try again.');
    }
});

module.exports = router;

/* this shit make everything go boom
// Custom error handler for 403 Forbidden
router.get('/error/403', (req, res) => {
    res.status(403).sendFile(path.join(rootDir, 'public', 'errors', 'error.html'));
});

// Custom error handler for 500 Internal Server Error
router.get('/error/500', (req, res) => {
    res.status(500).sendFile(path.join(rootDir, 'public', 'errors', 'error.html'));
});

// Catch-all for unmatched routes (404)
router.use((req, res) => {
    res.status(404).sendFile(path.join(rootDir, 'public', 'errors', 'error.html'));
});*/
