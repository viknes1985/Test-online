const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Connect to SQLite database
let db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        mobile_number TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        state TEXT NOT NULL,
        district TEXT NOT NULL,
        category TEXT NOT NULL,
        provider_name TEXT NOT NULL,
        contact_number TEXT NOT NULL,
        operating_hours TEXT NOT NULL,
        sample_photo TEXT
    )`);
});

// User registration
app.post('/api/register', (req, res) => {
    const { firstName, lastName, mobileNumber, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    db.run(`INSERT INTO users (first_name, last_name, mobile_number, email, password) VALUES (?, ?, ?, ?, ?)`, 
    [firstName, lastName, mobileNumber, email, hashedPassword], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Add new service
app.post('/api/services', (req, res) => {
    const { state, district, category, providerName, contactNumber, operatingHours, samplePhoto } = req.body;
    
    db.run(`INSERT INTO services (state, district, category, provider_name, contact_number, operating_hours, sample_photo) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
    [state, district, category, providerName, contactNumber, operatingHours, samplePhoto], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Find services
app.get('/api/services', (req, res) => {
    const { state, district, category } = req.query;
    let query = `SELECT * FROM services WHERE 1=1`;
    const params = [];

    if (state) {
        query += ` AND state = ?`;
        params.push(state);
    }
    if (district) {
        query += ` AND district = ?`;
        params.push(district);
    }
    if (category) {
        query += ` AND category = ?`;
        params.push(category);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
