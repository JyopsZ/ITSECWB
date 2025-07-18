const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reserveSchema = new mongoose.Schema({
    labName: String,
    seatPos: [Number],
    date: String,
    time: String,
    reserver: String,
    reservationID: Number
})

reserveSchema.plugin(AutoIncrement, { inc_field: 'reservationID', start_seq: 1018 });
const Reservation = mongoose.model('Reservation', reserveSchema)

module.exports = Reservation