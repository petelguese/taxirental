let mongoose = require('mongoose');


let carSchema = new mongoose.Schema({
    vehicleNumber: {
        type: String,
        unique: true,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    seatingCapacity: {
        type: Number,
        required: true
    },
    rentPerDay: {
        type: Number,
        required: true
    },
    bookingStatus: {
        type:String
    },
    customerId: {
        type: Array,
        items: {
            type: String
        }
    }
})
module.exports = mongoose.model('car', carSchema);