const express = require("express");
const router = express.Router();
const path = require('path');
const pool = require('../util/db.js');
const session = require('express-session');

router.post("/api/auth/:username/:password", (req, res) => {
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
        console.log('Session:', req.sessionID);
        return res.status(200).json({ message: 'Login successful', user: req.session.user });

    });
})

router.post("/api/auth", (req, res) => {
    console.log('Session:', req.sessionID);
    req.session.user = {

    };
    return res.status(200).json({ message: 'Login successful', user: req.session.user });
})



module.exports = router;