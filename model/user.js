// model/user.js
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    image: { type: String, default: null },
    userID: { type: Number, unique: true },

    securityQuestion: { type: String, required: false},
    securityAnswer: { type: String, required: false },
    lastPasswordChange: {type: Date, default: Date.now},
    // For login attempt tracking
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
});


// ✅ Enable auto-increment for userID
userSchema.plugin(AutoIncrement, { inc_field: 'userID' });

const User = mongoose.model('User', userSchema);

module.exports = User;
