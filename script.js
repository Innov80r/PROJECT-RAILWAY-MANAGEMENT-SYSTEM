let currentPage = 1;
const trainsPerPage = 10;

async function loadTrains() {
    const res = await fetch(`/trains`);
    const trains = await res.json();
    displayTrains(trains);
}

function displayTrains(trains) {
    const container = document.getElementById('train-table-container');
    const pagination = document.getElementById('pagination-controls');

    const start = (currentPage - 1) * trainsPerPage;
    const end = start + trainsPerPage;
    const paginated = trains.slice(start, end);

    let html = `<table><tr>
        <th>No</th><th>Name</th><th>From</th><th>To</th><th>Depart</th><th>Arrive</th><th>Status</th><th>Seats</th><th>Action</th>
    </tr>`;

    paginated.forEach(train => {
        html += `<tr>
            <td>${train.train_no}</td>
            <td>${train.name}</td>
            <td>${train.from_station}</td>
            <td>${train.to_station}</td>
            <td>${train.departure_time}</td>
            <td>${train.arrival_time}</td>
            <td>${train.status}</td>
            <td>${train.available_seats}</td>
            <td><a href="/book.html">Book</a></td>
        </tr>`;
    });

    html += `</table>`;
    container.innerHTML = html;

    // Pagination controls
    const totalPages = Math.ceil(trains.length / trainsPerPage);
    pagination.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.onclick = () => {
            currentPage = i;
            displayTrains(trains);
        };
        pagination.appendChild(btn);
    }
}

window.onload = loadTrains;
const currentPag = location.pathname.split("/").pop();
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.getAttribute("data-page") === currentPage) {
      link.style.backgroundColor = "#2563eb";
      link.style.padding = "0.5rem 1rem";
      link.style.borderRadius = "5px";
    }
  });
