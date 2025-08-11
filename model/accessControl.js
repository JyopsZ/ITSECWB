const mongoose = require('mongoose')

const accessControlSchema = new mongoose.Schema({
    userID: { type: Number, required: true },
    description: { type: String, required: true },
    timestamp: {
        type: Date, 
        default: () => {
            const now = new Date();
            
            return new Date(now.getTime() + (8 * 60 * 60 * 1000)); // convert to philippine standard time
        }
    }
})

const accessControl = mongoose.model('AccessControl', accessControlSchema)

module.exports = accessControl