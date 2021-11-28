const mongoose = require('mongoose')

const roomSchema = mongoose.Schema({
    capacity: {
        type: Number,
        required: true,
        validate: (n) => {n > 0}
    },
    people: [{type: mongoose.Schema.Types.ObjectId, ref: 'Person'}]
});

const room = mongoose.model('Room', roomSchema);

module.exports = room;