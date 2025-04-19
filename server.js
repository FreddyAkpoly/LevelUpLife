const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const session = require('express-session');
require('dotenv').config();

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 60000 * 60,
        secure: false // set to true if using HTTPS
    }
}));


const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false        // necessary for self-signed certs on TiDB Cloud
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database!');
});

//temp sessions change 
app.get('/quests', (req, res) => {
    console.log(req.session);
    console.log(req.session.id);
    req.session.visited = true;
    res.sendFile(path.join(__dirname, 'public/html/quests.html'));
});

app.get('/', (req, res) => {
    if (req.session.user) {
        console.log(req.session.user);
        res.sendFile(path.join(__dirname, 'public/html/quests.html'));
    }
    else {
        res.sendFile(path.join(__dirname, 'public/html/main.html'));
    }

});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/register.html'));
});



app.get('/status', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/status.html'));
});


app.get('/api/quests/:questId', (req, res) => {
    const { questId } = req.params;  // Get questId from the URL parameters

    const query = 'SELECT * FROM quest_list WHERE quest_id = ?';

    connection.query(query, [questId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Quest not found' });
        }

        res.json(results[0]);  // Return the first (and only) result 
    });
});


app.get('/api/status', (req, res) => {
    const query = 'SELECT * FROM users WHERE user_id = ?';
    console.log(req.session.user.user_id);
    connection.query(query, [req.session.user.user_id], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        console.log(results[0]);
        res.json(results);
    });
});



app.put('/api/status/:userID/:stat/:new_value', (req, res) => {

    const userId = req.params.userID;
    const stat = req.params.stat;
    const newValue = req.params.new_value;
    console.log("UPDATED VAL " + newValue);
    const allowedStats = ['Creativity', 'Health', 'Food', 'Mental', 'Social'];

    if (!allowedStats.includes(stat)) {
        return res.status(400).json({ error: 'Invalid stat type' });
    }

    const query = `UPDATE users SET ${stat} = ? WHERE user_id = ?`;

    connection.query(query, [newValue, userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: `User ${stat} stat updated successfully` });
    });
});

app.get('/api/quest_status/:questId', (req, res) => {
    const {questId } = req.params;

    const query = `
        SELECT is_completed
        FROM user_quest_status
        WHERE user_id = ? AND quest_id = ?
    `;
    console.log(questId);


    connection.query(query, [req.session.user.user_id, questId], (err, results) => {
        console.log(results);
        if (err) {
            console.error('Error checking quest status:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.length === 0) {
            // User hasn't started or completed this quest
            return res.json({ completed: false });
        }

        res.json({ completed: !!results[0].is_completed });
    });
});

app.put('/api/quest_status/complete_quest/:questId', (req, res) => {
    const {questId } = req.params;

    const query = `
        INSERT INTO user_quest_status (user_id, quest_id, is_completed)
        VALUES (?, ?, true)
        ON DUPLICATE KEY UPDATE is_completed = true;
    `;

    connection.query(query, [req.session.user.user_id, questId], (err, results) => {
        if (err) {
            console.error('Error updating quest status:', err);
            return res.status(500).json({ error: 'Database update failed' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User or quest not found' });
        }

        res.json({ message: `Quest ${questId} marked as completed for user ${userId}.` });
    });
});


// ask db for password of user, return if passed in password matches db password
app.get('/api/login/:username/:password', (req, res) => {
    const username = req.params.username;
    const password = req.params.password;
    const query = 'SELECT password_hash FROM users WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching completed quests:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0].password_hash === password);
    });
});

app.post("/api/auth/:username/:password", (req, res) => {
    const username = req.params.username;
    const password = req.params.password;

    const query = 'SELECT * FROM users WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching completed quests:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (results[0].password_hash !== password) {
            return res.status(404).json({ error: 'invalid login info' });
        }
        req.session.user = results[0];
        return res.status(200).send(results);
    });
})

app.get("/api/auth/status", (req, res) => {
    return req.session.user ? res.status(200).send(req.session.user) : res.status(401).send({ msg: "Not authenticated" });
});


//  add user to db [NEW]
app.put('/api/register/:username/:password', async (req, res) => {
    const { username, password } = req.params;

    // Generate random integer ID
    const generateId = () => Math.floor(Math.random() * 1000000);

    const insertUser = () => {
        const id = generateId();

        const checkQuery = `SELECT user_id FROM users WHERE user_id = ?`;
        connection.query(checkQuery, [id], (err, results) => {
            if (err) {
                console.error('Error checking ID:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length > 0) {
                // ID already exists, try again
                insertUser();
            } else {
                // ID is unique, insert user
                const insertQuery = `
                    INSERT INTO users (user_id, username, password_hash)
                    VALUES (?, ?, ?)
                `;
                connection.query(insertQuery, [id, username, password], (err, results) => {
                    if (err) {
                        console.error('Error inserting user:', err);
                        return res.status(500).json({ error: 'Insert failed' });
                    }

                    res.json({ message: `User added with ID ${id}` });
                });
            }
        });
    };

    insertUser();
});

// ask db if username is available 
app.get('/api/register/:username', (req, res) => {
    const username = req.params.username;
    const query = 'SELECT username FROM users WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching completed quests:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (results.length === 0) {

        }
        res.json(results.length === 0);
    });
});


// Ask db for user id for username
app.get('/api/login/:username', (req, res) => {

    const username = req.params.username;
    const query = 'SELECT user_id FROM users WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching completed quests:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log(results);

        res.json(results[0].user_id);
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
