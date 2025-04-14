const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const session = require('express-session');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use(session({
    secret: 'your-secret-key', // replace with a strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true if using HTTPS
}));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Quests',
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database!');
});


app.get('/quests/', (req, res) => {
    res.sendFile(path.join(__dirname, 'quests.html'));
});

app.get('/quests/:username', (req, res) => {
    res.sendFile(path.join(__dirname, 'quests.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/status', (req, res) => {
    res.sendFile(path.join(__dirname, 'status.html'));
});


app.get('/status/:userID', (req, res) => {
    res.sendFile(path.join(__dirname, 'status.html'));
});


app.get('/api/quests', (req, res) => {
    connection.query('SELECT * FROM DailyQuest', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});
app.get('/api/status', (req, res) => {
    connection.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

app.get('/api/status/:userid', (req, res) => {
    const userId = req.params.userid;
    const query = 'SELECT * FROM users WHERE user_id = ?';
    connection.query(query,[userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});


app.put('/api/status/:stat', (req, res) => {
    const { userId } = req.body;
    const stat = req.params.stat;
    const newValue = req.body[stat];

    // Whitelist allowed stats to prevent SQL injection
    const allowedStats = ['creativity', 'health', 'food', 'mental', 'social'];

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

app.get('/api/quest_status/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = 'SELECT quest_status FROM users WHERE user_id = ?';

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching completed quests:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }


        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Parse JSON before sending (optional, depending on frontend needs)
        const quest_status = results[0].quest_status;

        res.json({ quest_status: quest_status });
    });
});

app.put('/api/quest_status/complete_quest/:userId/:day', (req, res) => {
    const userId = req.params.userId;
    const day = req.params.day; // This should be a string for the JSON key

    const query = `
      UPDATE Quests.users
      SET quest_status = JSON_SET(quest_status, '$."${day}"', true)
      WHERE user_id = ?;
    `;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error updating quest status:', err);
            return res.status(500).json({ error: 'Database update failed' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: `Quest day ${day} marked as completed.` });
    });
});


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

app.get('/api/login/:username', (req, res)=>{
    
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


app.listen(3000, () => {
    // console.log("Watching the port");
})

// connection.query('SELECT * FROM users', (err, results) => {
//     if (err) {
//       console.error('Error executing query:', err);
//       return;
//     }
//     console.log('Query results:', results);
//   });
