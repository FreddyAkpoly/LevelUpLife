const express = require("express");
const router = express.Router();
const path = require('path');
const pool = require('../util/db.js');

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/login.html'));
});
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/register.html'));
});
router.get('/api/username', (req, res) => {
    const query = 'SELECT username FROM users WHERE user_id = ?';
    pool.query(query, [req.session.user.user_id], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});
router.get('/api/login/:username/:password', async (req, res) => {
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

router.put('/api/register/:username/:password', async (req, res) => {
    const { username, password } = req.params;

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
                insertUser();
            } else {
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

router.get('/api/register/:username', (req, res) => {
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

module.exports = router;