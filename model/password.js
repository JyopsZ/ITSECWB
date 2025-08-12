// model/password.js
const mongoose = require('mongoose');

const passwordHistorySchema = new mongoose.Schema({
    userID: { 
        type: Number, 
        required: true,
        ref: 'User'
    },
    hashedPassword: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Index for faster queries
passwordHistorySchema.index({ userID: 1, createdAt: -1 });

// Keep only last 12 passwords per user (configurable)
passwordHistorySchema.statics.addPasswordHistory = async function(userID, hashedPassword) {
    const MAX_PASSWORD_HISTORY = 12;
    
    try {
        // Add new password to history
        await this.create({
            userID: userID,
            hashedPassword: hashedPassword
        });
        
        // Remove old passwords beyond the limit
        const passwords = await this.find({ userID })
            .sort({ createdAt: -1 })
            .skip(MAX_PASSWORD_HISTORY);
        
        if (passwords.length > 0) {
            const oldPasswordIds = passwords.map(p => p._id);
            await this.deleteMany({ _id: { $in: oldPasswordIds } });
        }
    } catch (error) {
        console.error('Error adding password to history:', error);
        throw error;
    }
};

// Check if password was used before
passwordHistorySchema.statics.isPasswordUsedBefore = async function(userID, plainTextPassword) {
    const bcryptjs = require('bcryptjs');
    
    try {
        // Make sure we have valid inputs
        if (!userID || !plainTextPassword) {
            console.error('Invalid parameters for password history check:', { userID, plainTextPassword: !!plainTextPassword });
            return false;
        }

        const passwordHistory = await this.find({ userID }).sort({ createdAt: -1 });
        
        console.log(`Checking password history for user ${userID}. Found ${passwordHistory.length} previous passwords.`);
        
        for (const oldPasswordRecord of passwordHistory) {
            try {
                // Ensure we have valid hashed password
                if (!oldPasswordRecord.hashedPassword || typeof oldPasswordRecord.hashedPassword !== 'string') {
                    console.warn('Invalid hashed password in history:', oldPasswordRecord);
                    continue;
                }

                const isMatch = await bcryptjs.compare(plainTextPassword, oldPasswordRecord.hashedPassword);
                if (isMatch) {
                    console.log('Password reuse detected for user:', userID);
                    return true;
                }
            } catch (compareError) {
                console.error('Error comparing password:', compareError);
                continue; // Skip this comparison and continue with others
            }
        }
        
        console.log('No password reuse detected for user:', userID);
        return false;
        
    } catch (error) {
        console.error('Error checking password history:', error);
        return false; // In case of error, allow password change but log the issue
    }
};

// Get the most recent password change date for a user
passwordHistorySchema.statics.getLastPasswordChangeDate = async function(userID) {
    try {
        const lastPassword = await this.findOne({ userID })
            .sort({ createdAt: -1 });
        
        return lastPassword ? lastPassword.createdAt : null;
    } catch (error) {
        console.error('Error getting last password change date:', error);
        return null;
    }
};

const PasswordHistory = mongoose.model('PasswordHistory', passwordHistorySchema);

module.exports = PasswordHistory;