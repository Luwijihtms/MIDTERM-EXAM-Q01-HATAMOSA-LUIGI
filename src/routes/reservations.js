const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dataFilePath = path.join(__dirname, '../../data.json');

function readReservations(){
    return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
}

function saveReservations(reservations){
    fs.writeFileSync(dataFilePath, JSON.stringify(reservations, null, 2));
}

router.get('/', (req, res) => {
    res.json(readReservations());
});

router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    const reservation = readReservations().find(item => item.id === id);

    if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found.' });
    }

    res.json(reservation);
});

router.post('/', (req, res) => {
    const fields = ['room', 'reserved_by', 'date', 'start_time', 'end_time'];
    const reservationData = {};

    for (const field of fields){
        const value = req.body[field];

        if (typeof value !== 'string' || !value.trim()) {
            return res.status(400).json({ message: `${field} is required.` });
        }

        reservationData[field] = value.trim();
    }

    const reservations = readReservations();
    const roomIsTaken = reservations.some(reservation =>
        reservation.room === reservationData.room &&
        reservation.date === reservationData.date
    );

    if (roomIsTaken){
        return res.status(409).json({
            message: 'This room already has a reservation on that date.'
        });
    }

    const nextId = reservations.reduce(
        (highestId, reservation) => Math.max(highestId, reservation.id),
        0
    ) + 1;

    const newReservation = { id: nextId, ...reservationData };
    reservations.push(newReservation);
    saveReservations(reservations);

    res.status(201).json(newReservation);
});

router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)){
        return res.status(400).json({ message: 'ID must be a number.' });
    }

    const reservations = readReservations();
    const index = reservations.findIndex(reservation => reservation.id === id);

    if (index === -1){
        return res.status(404).json({ message: 'Reservation not found.' });
    }

    reservations.splice(index, 1);
    saveReservations(reservations);

    res.status(204).send();
});

module.exports = router;