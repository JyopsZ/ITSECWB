const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
    title: String,
    description: String,
    email: String,
    role: String,
    image: String
})

const Profile = mongoose.model('Profile', profileSchema)

module.exports = Profile