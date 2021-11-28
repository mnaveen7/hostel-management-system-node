const router = require('express').Router();
const db = require('../database/database');
const axios = require('axios').default;

axios.defaults.baseURL = 'http://localhost:3000'

router.get('/', async (req, res) => {
    const rooms = await (await axios.get('/api/rooms')).data;
    res.render('index', {rooms, alertRoom: false});
});

router.get('/rooms/add', async(req, res) => {
    res.render('addRoom');
});

router.get('/rooms/view/:id', async(req, res) => {
    const roomId = req.params.id;
    const room = await (await axios.get(`/api/rooms/${roomId}`)).data;
    res.render('roomView', {people: room.people, roomId})
});

router.get('/rooms/delete/:id', async(req, res) => {
    const roomId = req.params.id;
    const room = await (await axios.get(`/api/rooms/${roomId}`)).data;
    if(room.people.length > 0) {
        const rooms = await (await axios.get(`api/rooms`)).data;
        res.render('index', {rooms, alertRoom: true, message: 'Room is not empty.'})
    } else {
        await axios.delete(`/api/rooms/${roomId}`);
        res.redirect('/');
    }
});

router.get('/people/add/:id', async(req, res) => {
    const roomId = req.params.id;
    res.render('addPerson', {roomId});
});

router.get('/people/delete/:id', async(req, res) => {
    const id = req.params.id;
    const person = await (await axios.get(`/api/people/${id}`)).data;
    const roomId = person.room;
    await (await axios.delete(`/api/people/${id}`)).data;
    res.redirect(`/rooms/view/${roomId}`);
});

router.get('/people/update/:id', async(req, res) => {
    const id = req.params.id;
    const person = await (await axios.get(`/api/people/${id}`)).data;
    const rooms = await (await axios.get('/api/rooms')).data;
    res.render('updatePerson', {person, rooms, roomId: person.room});
});

router.get('/api/rooms', async (req, res) => {
    const data = await db.getRooms();
    res.send(data);
});

router.get('/api/rooms/:id', async (req, res) => {
    const id = req.params.id;
    const data = await db.getRoomById(id);
    res.send(data);
});


router.post('/api/rooms', async (req, res) => {
    const capacity = req.body.capacity;
    if(capacity <= 0 || capacity == null || capacity == undefined) {
        const rooms = await db.getRooms();
        res.render('index', {rooms, alertRoom: true, message: 'Capacity should be more than 0'})
        return;
    }
    const room = await db.createRoom(capacity);
    res.redirect('/')
});

router.get('/api/people/:id', async(req, res) => {
    const id = req.params.id;
    const person = await db.getPersonById(id);
    res.send(person);
});

router.post('/api/people/:id', async (req, res) => {
    const roomId = req.params.id;
    const name = req.body.name;
    if(name == '' || name == null || name == undefined) {
        const rooms = await db.getRooms();
        res.render('index', {rooms, alertRoom: true, message: 'Name cannot be empty'})
        return;
    }
    const feeStatus = req.body.feeStatus;
    const room = await db.getRoomById(roomId);
    if(room.people.length >= room.capacity) {
        const rooms = db.getRooms();
        res.render('index', {rooms, alertRoom: true, message: 'Room is Full'});
        return;
    }
    const person = await db.createPerson(name, feeStatus, room);
    const updatedRoom = await db.addPersonToRoom(roomId, person);
    res.redirect(`/rooms/view/${roomId}`)
});

router.post('/api/people/update/:id', async(req, res) => {
    const id = req.params.id;
    const person = await db.getPersonById(id);
    const oldRoom = person.room;
    const name = (req.body.name == '' || !req.body.name)? person.name : req.body.name;
    const roomId = (req.body.room == '' || !req.body.room)? person.room : req.body.room.trim();
    const feeStatus = req.body.feeStatus;
    if(oldRoom != roomId) {
        const newRoom = await db.getRoomById(roomId);
        if(newRoom.people.length < newRoom.capacity) {
            await db.removePersonFromRoom(oldRoom, person);
            await db.addPersonToRoom(roomId, person);
        }
        else {
            const rooms = db.getRooms();
            res.render('index', {rooms, alertRoom: true, message: 'Room is Full'});
            return;
        }
    }
    const newPerson = await db.updatePerson(id, name, roomId, feeStatus);
    res.redirect(`/rooms/view/${oldRoom}`);
});

router.delete('/api/people/:id', async (req, res) => {
    const personId = req.params.id;
    const result = await db.removePerson(personId);
    res.send(result);
});

router.delete('/api/rooms/:id', async (req, res) => {
    const id = req.params.id;
    const result = await db.removeRoom(id);
    res.send(result);
})

module.exports = router;