// model/password.js
const mongoose = require('mongoose');

const passwordHistorySchema = new mongoose.Schema({
    userID: { type: Number, required: true,ref: 'User'},
    hashedPassword: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

passwordHistorySchema.index({ userID: 1, createdAt: -1 });

passwordHistorySchema.statics.addPasswordHistory = async function(userID, hashedPassword) {
    const MAX_PASSWORD_HISTORY = 12;
    
    try {
        await this.create({
            userID: userID,
            hashedPassword: hashedPassword
        });
    
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

// Tracker if password was already reused, thus this msut be prevented.
passwordHistorySchema.statics.isPasswordUsedBefore = async function(userID, plainTextPassword) {
    const bcryptjs = require('bcryptjs');
    
    try {
        if (!userID || !plainTextPassword) {
            console.error('Invalid parameters for password history check:', { userID, plainTextPassword: !!plainTextPassword });
            return false;
        }

        const passwordHistory = await this.find({ userID }).sort({ createdAt: -1 });
        
        //console.log(`Checking password history for user ${userID}. Found ${passwordHistory.length} previous passwords.`);
        
        for (const oldPasswordRecord of passwordHistory) {
            try {
                if (!oldPasswordRecord.hashedPassword || typeof oldPasswordRecord.hashedPassword !== 'string') {
                    console.warn('Invalid hashed password in history:', oldPasswordRecord);
                    continue;
                }

                const isMatch = await bcryptjs.compare(plainTextPassword, oldPasswordRecord.hashedPassword);
                if (isMatch) {
                    //console.log('Password reuse detected for user:', userID);
                    return true;
                }
            } catch (compareError) {
                console.error('Error comparing password:', compareError);
                continue;
            }
        }
        
        //console.log('No password reuse detected for user:', userID);
        return false;
        
    } catch (error) {
        console.error('Error checking password history:', error);
        return false;
    }
};

// For tracking the password change date
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

// For checking if the user can change the password if its been a day old (thank you stackoverflow)
passwordHistorySchema.statics.canChangePassword = async function(userID) {
    try {
        const lastChangeDate = await this.getLastPasswordChangeDate(userID);
        
        if (!lastChangeDate) {
            return true; 
        }
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return lastChangeDate <= oneDayAgo;
    } catch (error) {
        console.error('Error checking if user can change password:', error);
        return false;
    }

    /* If we wanna test without having to wait 24 hours
    try {
        return true;
    } catch (error) {
        console.error('Error checking if user can change password:', error);
        return false;
    }
     */
};

// Get time until user can change password again
passwordHistorySchema.statics.getTimeUntilNextPasswordChange = async function(userID) {
    try {
        const lastChangeDate = await this.getLastPasswordChangeDate(userID);
        
        if (!lastChangeDate) {
            return 0;
        }
        
        const oneDayFromLastChange = new Date(lastChangeDate.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();
        
        if (now >= oneDayFromLastChange) {
            return 0;
        }
        
        return oneDayFromLastChange - now;
    } catch (error) {
        console.error('Error calculating time until next password change:', error);
        return -1;
    }

    /*    If we wanna test without having to wait 24 hours
    try {
        
        return 0;
    } catch (error) {
        console.error('Error calculating time until next password change:', error);
        return -1;
    }
     */
};

const PasswordHistory = mongoose.model('PasswordHistory', passwordHistorySchema);

module.exports = PasswordHistory;