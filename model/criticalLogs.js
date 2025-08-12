const mongoose = require('mongoose')

const criticalLogsSchema = new mongoose.Schema({
    userID: { type: Number, required: false},
    field: { type: String, required: true },
    operation: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: {
        type: Date, 
        default: () => {
            const now = new Date();
            
            return new Date(now.getTime() + (8 * 60 * 60 * 1000)); // convert to philippine standard time
        }
    }
})

const inputValidation = mongoose.model('InputValidation', inputValidationSchema)

module.exports = inputValidation