let mongoose = require('mongoose');

let customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    issueDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date,
        required: true
    },
    carType: {
        type: Object,
        properties:{
            model: String,
            rentPerDay: Number,
            seatingCapacity: Number
        },
        required: true
    }
})
module.exports = mongoose.model('customer', customerSchema)