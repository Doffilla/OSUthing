// Main function to assign seats to students
function assignSeats() {
    const studentNames = [...new Set(
        document.getElementById('studentNames').value.trim().split('\n').map(name => name.trim()).filter(name => name)
    )];
    
    const totalSeats = parseInt(document.getElementById('totalSeats').value);
    
    const reservedSeatsInput = document.getElementById('reservedSeats').value.trim().split('\n').map(entry => entry.trim()).filter(entry => entry);
    const reservedSeats = {};
    const reservedNames = [];

    for (const entry of reservedSeatsInput) {
        const [name, seat] = entry.split(':').map(item => item.trim());
        const seatNumber = parseInt(seat);

        if (isNaN(seatNumber)) {
            alert(`${name}'s name is in the reserved seat list but no seat was specified.`);
            return;
        }
        if (seatNumber < 1 || seatNumber > totalSeats) {
            alert(`Invalid seat assignment: "${name}" is assigned to seat ${seatNumber}, but there are only ${totalSeats} seats available.`);
            return;
        }

        const uniqueName = name + (reservedNames.filter(n => n.startsWith(name)).length + 1);
        reservedSeats[uniqueName] = seatNumber;
        reservedNames.push(name);
    }

    const reservedNameSet = new Set(reservedNames);
    const unassignedStudents = studentNames.filter(name => !reservedNameSet.has(name));
    const availableSeats = Array.from({ length: totalSeats }, (_, i) => i + 1).filter(seat => !Object.values(reservedSeats).includes(seat));

    if (unassignedStudents.length > availableSeats.length) {
        alert('Not enough seats for all students.');
        return;
    }

    const evenlyDistributedSeats = distributeSeatsEvenly(availableSeats, unassignedStudents.length, Object.values(reservedSeats));
    shuffleArray(evenlyDistributedSeats);

    const seatAssignments = { ...reservedSeats };
    unassignedStudents.forEach((student, index) => {
        seatAssignments[student] = evenlyDistributedSeats[index];
    });

    if (!validateSeatAssignments(seatAssignments)) {
        return;
    }

    displayResults(seatAssignments, reservedNames, totalSeats);
    document.getElementById('printButton').style.display = 'block';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function distributeSeatsEvenly(seats, count, reservedSeats) {
    const avoidanceSeats = new Set();

    reservedSeats.forEach(seat => {
        if (seat > 1) avoidanceSeats.add(seat - 1);
        if (seat < seats.length) avoidanceSeats.add(seat + 1);
    });

    const prioritizedSeats = seats.filter(seat => !avoidanceSeats.has(seat));
    const fallbackSeats = seats.filter(seat => avoidanceSeats.has(seat));
    const step = Math.floor(prioritizedSeats.length / count) || 1;
    const distributedSeats = [];

    for (let i = 0; i < count; i++) {
        const seat = prioritizedSeats[i * step] || fallbackSeats[i % fallbackSeats.length];
        distributedSeats.push(seat);
    }
    return distributedSeats;
}

function validateSeatAssignments(seatAssignments) {
    const assignedSeats = Object.values(seatAssignments);
    const seatCounts = assignedSeats.reduce((counts, seat) => {
        counts[seat] = (counts[seat] || 0) + 1;
        return counts;
    }, {});

    const duplicateSeats = Object.entries(seatCounts).filter(([seat, count]) => count > 1);

    if (duplicateSeats.length > 0) {
        const duplicateMessage = duplicateSeats
            .map(([seat, count]) => `Seat ${seat} is assigned to ${count} people.`)
            .join('\n');
        alert(`Error: Duplicate seat assignments detected.\n\n${duplicateMessage}`);
        return false;
    }
    return true;
}

function displayResults(seatAssignments, reservedNames, totalSeats) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<hr /><br><h2>Seat Assignments</h2>';

    const allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);
    const occupiedSeats = new Set(Object.values(seatAssignments));
    const unoccupiedSeats = allSeats.filter(seat => !occupiedSeats.has(seat));

    const unoccupiedDiv = document.createElement('div');
    unoccupiedDiv.classList.add('unoccupied');
    unoccupiedDiv.innerHTML = `<strong>Unoccupied:</strong> ${unoccupiedSeats.join(', ') || 'None'}`;
    resultDiv.appendChild(unoccupiedDiv);

    const container = document.createElement('div');
    container.classList.add('container-columns');

    const column1 = document.createElement('div');
    column1.classList.add('column');
    const column2 = document.createElement('div');
    column2.classList.add('column');

    let index = 0;
    const sortedSeatAssignments = Object.entries(seatAssignments).sort(([a], [b]) => a.localeCompare(b));

    sortedSeatAssignments.forEach(([student, seat]) => {
        const displayName = reservedNames.includes(student.replace(/\d+$/, '')) ? student.replace(/\d+$/, '') : student;

        const seatPair = document.createElement('div');
        seatPair.classList.add('seat-pair');
        seatPair.innerHTML = `<span>${displayName}</span><span>${seat}</span>`;

        if (index % 2 === 0) {
            column1.appendChild(seatPair);
        } else {
            column2.appendChild(seatPair);
        }

        index++;
    });

    container.appendChild(column1);
    container.appendChild(column2);
    resultDiv.appendChild(container);
}

function printResults() {
    const resultDiv = document.getElementById('result');
    const printWindow = window.open('', '', 'height=600,width=800');

    printWindow.document.write('<html><head><title>Seat Assignments</title>');
    printWindow.document.write('<style>/* CSS styling for print */</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(resultDiv.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}
