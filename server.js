const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const session = require('express-session');
require('dotenv').config();

let quest_id = new Date().getDate() + parseInt(process.env.OFFSET);
 
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

const isProduction = process.env.NODE_ENV === 'production';

app.set("trust proxy", 1); 


app.use(session({
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 1000 * 60 * 60 // 1 hour 
    }
}));


// const connection = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     ssl: {
//         minVersion: 'TLSv1.2',
//         rejectUnauthorized: false        // necessary for self-signed certs on TiDB Cloud
//     },
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// connection.connect((err) => {
//     if (err) {
//         console.error('Error connecting to database:', err);
//         return;
//     }
//     console.log('Connected to MySQL database!');
// });
pool.query('SELECT * FROM quest_list WHERE quest_id = ?',[quest_id], (err, results) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log(results);
    }
}); 


app.get('/quests', (req, res) => {
    
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
    console.log("Full session:", req.session);
    res.sendFile(path.join(__dirname, 'public/html/status.html'));
});


app.get('/api/quests', (req, res) => {
    
    function getQuestById(id, callback) {
        const query = 'SELECT * FROM quest_list WHERE quest_id = ?';
        pool.query(query, [id], (err, results) => {
            if (err) return callback(err, null);
            if (results.length === 0) return callback(null, null); // no quest found
            callback(null, results[0]);
        });
    }

    function tryFetchQuest(id) {
        getQuestById(id, (err, quest) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Database query failed' });
            }

            if (!quest) {
                // If not found, try next questId
                return tryFetchQuest(id + 1);
            }

            res.json(quest); // Quest found, send it
        });
    }

    tryFetchQuest(quest_id); // Start trying from the initial ID
});



app.get('/api/status', (req, res) => {
    // console.log('Session:', req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    console.log('Session:', req.session);
    const query = 'SELECT * FROM users WHERE user_id = ?';
    pool.query(query, [req.session.user.user_id], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        console.log(results[0]);
        res.json(results);
    });
});



app.put('/api/status/:stat/:new_value', (req, res) => {

    const stat = req.params.stat;
    const newValue = req.params.new_value;
    console.log("UPDATED VAL " + newValue);
    const allowedStats = ['Creativity', 'Health', 'Food', 'Mental', 'Social'];

    if (!allowedStats.includes(stat)) {
        return res.status(400).json({ error: 'Invalid stat type' });
    }

    const query = `UPDATE users SET ${stat} = ? WHERE user_id = ?`;

    pool.query(query, [newValue, req.session.user.user_id], (err, results) => {
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

app.get('/api/quest_status', (req, res) => {
   

    const query = `
        SELECT is_completed
        FROM user_quest_status
        WHERE user_id = ? AND quest_id = ?
    `;
   


    pool.query(query, [req.session.user.user_id, quest_id], (err, results) => {
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

app.put('/api/quest_status/complete_quest', (req, res) => {
    

    const query = `
        INSERT INTO user_quest_status (user_id, quest_id, is_completed)
        VALUES (?, ?, true)
        ON DUPLICATE KEY UPDATE is_completed = true;
    `;

    pool.query(query, [req.session.user.user_id, quest_id], (err, results) => {
        if (err) {
            console.error('Error updating quest status:', err);
            return res.status(500).json({ error: 'Database update failed' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User or quest not found' });
        }

        res.json({ message: `Quest ${quest_id} marked as completed for user.` });
    });
});


// ask db for password of user, return if passed in password matches db password
app.get('/api/login/:username/:password', async (req, res) => {
    const username = req.params.username;
    const password = req.params.password;
    const query = 'SELECT password_hash FROM users WHERE username = ?';
   
    
    pool.query(query, [username], (err, results) => {
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
    pool.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching completed quests:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
       
        const user = results[0];

        if (user.password_hash !== password) {
            return res.status(404).json({ error: 'invalid login info' });
        }


        req.session.user = {
            user_id: user.user_id,
            username: user.username
        };
        console.log('Session:', req.session.user);
        return res.status(200).json({ message: 'Login successful', user: req.session.user });

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
        pool.query(checkQuery, [id], (err, results) => {
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
                pool.query(insertQuery, [id, username, password], (err, results) => {
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
    pool.query(query, [username], (err, results) => {
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
    pool.query(query, [username], (err, results) => {
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
    //console.log(`Server running on port ${PORT}`);
});
