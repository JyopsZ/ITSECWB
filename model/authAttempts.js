const mongoose = require('mongoose')

const authAttemptsSchema = new mongoose.Schema({
    email: { type: String, required: true },
    status: { type: String, required: true },
    description: { type: String, required: false },
    timestamp: {
        type: Date, 
        default: () => {
            const now = new Date();
            
            return new Date(now.getTime() + (8 * 60 * 60 * 1000)); // convert to philippine standard time
        }
    }
})

const authAttempts = mongoose.model('AuthAttempts', authAttemptsSchema)

module.exports = authAttempts