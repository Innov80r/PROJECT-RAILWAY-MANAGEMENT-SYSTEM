const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 8000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static files (like index.html, book.html, status.html, etc.)
app.use(express.static(path.join(__dirname)));

// MySQL Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', // change this if your MySQL password is different
    database: 'railway' // replace with your actual database name
});

db.connect(err => {
    if (err) {
        console.error('DB connection error:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// 🔹 Root route (loads index.html by default)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 🔹 Endpoint to fetch station list
app.get('/stations', (req, res) => {
    const sql = 'SELECT station_name FROM stations'; // assuming you have a stations table with 'station_name' column
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching stations:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.json({ message: 'No stations found.' });
        }

        // Send the station names as response
        res.json(results.map(row => row.station_name));
    });
});

// 🔹 Get scheduled trains based on source and destination
app.get('/scheduledTrains', (req, res) => {
    const { from, to } = req.query;

    // Check if both 'from' and 'to' stations are provided
    if (!from || !to) {
        return res.status(400).json({ error: 'Please provide both source and destination stations.' });
    }

    const sql = 'SELECT * FROM trains WHERE from_station = ? AND to_station = ?';
    db.query(sql, [from, to], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        // If no results found, send a message
        if (results.length === 0) {
            return res.json({ message: `No trains found between ${from} and ${to}.` });
        }

        // Send the fetched trains as a response
        res.json(results);
    });
});

// 🔹 Endpoint for booking tickets
app.post('/book', (req, res) => {
    const { name, age, from, to, seat_no } = req.body;

    if (!name || !age || !from || !to || !seat_no) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const status = "Confirmed"; // Default status

    const sql = 'INSERT INTO bookings (name, age, from_station, to_station, seat_no, status) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, age, from, to, seat_no, status], (err, result) => {
        if (err) {
            console.error("Booking Error:", err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({
            id: result.insertId,
            name,
            age,
            from,
            to,
            seat_no,
            status
        });
    });
});


// 🔹 Endpoint to get all trains (for train status page)
app.get('/trains', (req, res) => {
    const sql = 'SELECT * FROM trains';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching trains:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// 🔹 Endpoint for checking train status
app.get('/status', (req, res) => {
    const { train_no } = req.query;

    // Check if train number is provided
    if (!train_no) {
        return res.status(400).json({ error: 'Please provide a train number.' });
    }

    const sql = 'SELECT * FROM trains WHERE train_no = ?';
    db.query(sql, [train_no], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.json({ message: `No train found with train number ${train_no}.` });
        }

        const train = results[0];
        res.json({
            train_no: train.train_no,
            from_station: train.from_station,
            to_station: train.to_station,
            departure_time: train.departure_time,
            arrival_time: train.arrival_time,
            available_seats: train.available_seats
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
