function assignSeats() {
    const studentNames = document.getElementById('studentNames').value.trim().split('\n').map(name => name.trim()).filter(name => name);
    const totalSeats = parseInt(document.getElementById('totalSeats').value);
    const reservedSeatsInput = document.getElementById('reservedSeats').value.trim().split('\n').map(entry => entry.trim()).filter(entry => entry);
    const reservedSeats = {};

    reservedSeatsInput.forEach(entry => {
        const [name, seat] = entry.split(':').map(item => item.trim());
        reservedSeats[name] = parseInt(seat);
    });

    const availableSeats = Array.from({ length: totalSeats }, (_, i) => i + 1).filter(seat => !Object.values(reservedSeats).includes(seat));
    const unassignedStudents = studentNames.filter(name => !reservedSeats[name]);

    if (unassignedStudents.length > availableSeats.length) {
        alert('Not enough seats for all students.');
        return;
    }

    const evenlyDistributedSeats = distributeSeatsEvenly(availableSeats, unassignedStudents.length);
    shuffleArray(evenlyDistributedSeats);
    const seatAssignments = { ...reservedSeats };

    unassignedStudents.forEach((student, index) => {
        seatAssignments[student] = evenlyDistributedSeats[index];
    });

    displayResults(seatAssignments);

    document.getElementById('printButton').style.display = 'block';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function distributeSeatsEvenly(seats, count) {
    const step = Math.floor(seats.length / count);
    const distributedSeats = [];
    for (let i = 0; i < count; i++) {
        distributedSeats.push(seats[i * step]);
    }
    return distributedSeats;
}

function displayResults(seatAssignments) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<hr /> <h2>Seat Assignments</h2>';

    const container = document.createElement('div');
    container.classList.add('container-co
