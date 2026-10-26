const reservationsUrl = '/api/reservations';
const reservationForm = document.getElementById('reservation-form');
const searchForm = document.getElementById('reservation-search-form');
const reservationsList = document.getElementById('reservations-list');
const showAllButton = document.getElementById('show-reservations');

function renderReservations(reservations){
    reservationsList.replaceChildren();

    for(const reservation of reservations){
        const row = document.createElement('tr');

        const details = [
            reservation.id,
            reservation.room,
            reservation.reserved_by,
            reservation.date,
            reservation.start_time,
            reservation.end_time
        ];

        for(const detail of details){
            const cell = document.createElement('td');
            cell.textContent = detail ?? '';
            row.appendChild(cell);
        }

        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');

        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', () => deleteReservation(reservation.id));

        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);
        reservationsList.appendChild(row);
    }
}

async function getErrorMessage(response, fallback){
    const result = await response.json().catch(() => ({}));
    return result.message || result.error || fallback;
}

async function loadReservations(){
    try{
        const response = await fetch(reservationsUrl);

        if(!response.ok){
            throw new Error(await getErrorMessage(response, 'Could not load reservations.'));
        }

        const reservations = await response.json();

        if(!Array.isArray(reservations)){
            throw new Error('The reservation data is not a list.');
        }

        renderReservations(reservations);
    }catch (error){
        alert(error.message);
    }
}

async function searchReservation(event){
    event.preventDefault();

    const id = new FormData(searchForm).get('id')?.toString().trim();

    if(!id){
        alert('Enter a reservation ID.');
        return;
    }

    try{
        const response = await fetch(`${reservationsUrl}/${encodeURIComponent(id)}`);

        if(!response.ok){
            throw new Error(await getErrorMessage(response, 'Reservation not found.'));
        }

        const reservation = await response.json();
        renderReservations([reservation]);
    }catch (error){
        alert(error.message);
    }
}

async function addReservation(event){
    event.preventDefault();

    const reservation = Object.fromEntries(new FormData(reservationForm));

    try{
        const response = await fetch(reservationsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservation)
        });

        if(!response.ok){
            throw new Error(await getErrorMessage(response, 'Could not add reservation.'));
        }

        reservationForm.reset();
        await loadReservations();
    }catch (error){
        alert(error.message);
    }
}

async function deleteReservation(id){
    try{
        const response = await fetch(
            `${reservationsUrl}/${encodeURIComponent(id)}`,
            { method: 'DELETE' }
        );

        if(!response.ok){
            throw new Error(await getErrorMessage(response, 'Could not delete reservation.'));
        }

        await loadReservations();
    }catch (error){
        alert(error.message);
    }
}

reservationForm?.addEventListener('submit', addReservation);
searchForm?.addEventListener('submit', searchReservation);
showAllButton?.addEventListener('click', loadReservations);

loadReservations();