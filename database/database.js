const mongoose = require('mongoose')
const Person = require('../model/person')
const Room = require('../model/room')

mongoose.connect('mongodb://localhost/hostel').then(() => console.log('Connected'));

module.exports.createPerson = async (name, feeStatus, room) => {
    const person = new Person({
        name,
        feeStatus,
        room
    });
    const result = await person.save();
    return result;
}

module.exports.createRoom = async (capacity) => {
    const room = new Room({
        capacity
    })
    const result = await room.save();
    return result;
}

module.exports.getPeople = async () => {
    const persons = await Person.find();
    return persons;
}

module.exports.getRooms = async () => {
    const rooms = await Room.find().populate('people');
    return rooms;
}

module.exports.getRoomIds = async() => {
    const rooms = await Room.find().select({id: 1});
    return rooms;
}

module.exports.getPersonById = async (personId) => {
    const person = await Person.findById(personId);
    return person;
}

module.exports.getRoomById = async (roomId) => {
    const room = await Room.findById(roomId).populate('people');
    return room;
}

module.exports.addPersonToRoom = async (roomId, person) => {
    const result = await Room.findByIdAndUpdate(roomId, {$push: {people: person}}, {new: true}).populate('people');
    return result;
}

module.exports.updatePerson = async (id, name, room, feeStatus) => {
    const result = await Person.findByIdAndUpdate(id, {$set: {name: name, room: room, feeStatus: feeStatus}}, {new: true});
    return result;
}

module.exports.removePersonFromRoom = async (roomId, person) => {
    const result = await Room.findByIdAndUpdate(roomId, {$pull: {people: { $in: [person]}}}, {new: true});
    return result;
}

module.exports.removeRoom = async (id) => {
    const result = await Room.findByIdAndRemove(id);
    return result;
}

module.exports.removePerson = async (personId) => {
    const person = await this.getPersonById(personId);
    const roomId = person.room;
    await this.removePersonFromRoom(roomId, person);
    const result = await Person.findByIdAndRemove(personId);
    return result;
}