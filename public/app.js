const apiUrl = '/api/reservations';
const reservationForm = document.getElementById('reservation-form');
const reservationsList = document.getElementById('reservations-list');
const showReservationsButton = document.getElementById('show-reservations');

async function fetchReservations() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Could not load reservations.');

        const reservations = await response.json();
        if (!Array.isArray(reservations)) {
            throw new Error('Reservation data must be a JSON array.');
        }

        reservationsList.replaceChildren();

        reservations.forEach(reservation => {
            const row = document.createElement('tr');

            [
                reservation.id,
                reservation.room,
                reservation.reserved_by,
                reservation.date,
                reservation.start_time,
                reservation.end_time
            ].forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });

            const deleteCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-button';
            deleteButton.addEventListener('click', () => deleteReservation(reservation.id));

            deleteCell.appendChild(deleteButton);
            row.appendChild(deleteCell);
            reservationsList.appendChild(row);
        });
    } catch (error) {
        alert(error.message);
    }
}

async function addReservation(event) {
    event.preventDefault();

    const reservation = Object.fromEntries(new FormData(reservationForm).entries());

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservation)
        });

        if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.message || 'Could not add reservation.');
        }

        reservationForm.reset();
        await fetchReservations();
    } catch (error) {
        alert(error.message);
    }
}

async function deleteReservation(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.message || 'Could not delete reservation.');
        }

        await fetchReservations();
    } catch (error) {
        alert(error.message);
    }
}

reservationForm.addEventListener('submit', addReservation);
showReservationsButton?.addEventListener('click', fetchReservations);

fetchReservations();