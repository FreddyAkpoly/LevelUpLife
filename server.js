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
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true if using HTTPS
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


app.get('/quests/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/quests.html'));
});

app.get('/quests/:username', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/quests.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/main.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/login.html'));
});

app.get('/status', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/status.html'));
});


app.get('/status/:userID', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/status.html'));
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
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});


app.put('/api/status/:userID/:stat/:new_value', (req, res) => {
    
    const userId  = req.params.userID;
    const stat = req.params.stat;
    const newValue = req.params.new_value;
    console.log("UPDATED VAL " + newValue);
    // Whitelist allowed stats to prevent SQL injection
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

// app.get('/api/quest_status/:userId', (req, res) => {
//     const userId = req.params.userId;

//     const query = 'SELECT quest_status FROM users WHERE user_id = ?';

//     connection.query(query, [userId], (err, results) => {
//         if (err) {
//             console.error('Error fetching completed quests:', err);
//             return res.status(500).json({ error: 'Database query failed' });
//         }


//         if (results.length === 0) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         // Parse JSON before sending (optional, depending on frontend needs)
//         const quest_status = results[0].quest_status;

//         res.json({ quest_status: quest_status });
//     });
// });

app.get('/api/quest_status/:userId/:questId', (req, res) => {
    const { userId, questId } = req.params;

    const query = `
        SELECT is_completed
        FROM user_quest_status
        WHERE user_id = ? AND quest_id = ?
    `;
        console.log(questId);
    

    connection.query(query, [userId, questId], (err, results) => {
        console.log(results);
        if (err) {
            console.error('Error checking quest status:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.length === 0) {
            // User hasn't started or completed this quest
            return res.json({ completed: false });
        }

        res.json({ completed: !!results[0].is_completed});
    });
});


// app.put('/api/quest_status/complete_quest/:userId/:day', (req, res) => {
//     const userId = req.params.userId;
//     const day = req.params.day; // This should be a string for the JSON key

//     const query = `
//       UPDATE Quests.users
//       SET quest_status = JSON_SET(quest_status, '$."${day}"', true)
//       WHERE user_id = ?;
//     `;

//     connection.query(query, [userId], (err, results) => {
//         if (err) {
//             console.error('Error updating quest status:', err);
//             return res.status(500).json({ error: 'Database update failed' });
//         }

//         if (results.affectedRows === 0) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         res.json({ message: `Quest day ${day} marked as completed.` });
//     });
// });

app.put('/api/quest_status/complete_quest/:userId/:questId', (req, res) => {
    const { userId, questId } = req.params;

    const query = `
        INSERT INTO user_quest_status (user_id, quest_id, is_completed)
        VALUES (?, ?, true)
        ON DUPLICATE KEY UPDATE is_completed = true;
    `;

    connection.query(query, [userId, questId], (err, results) => {
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
