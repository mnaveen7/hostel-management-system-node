const mongoose = require('mongoose')

const personSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: (str) => {str != ''}
    },
    room: {type: mongoose.Schema.Types.ObjectId, ref: 'Room'},
    feeStatus: Boolean
});

const person = mongoose.model('Person', personSchema);

module.exports = person;