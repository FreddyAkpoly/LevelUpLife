const express = require("express");
const router = express.Router();
const path = require('path');
const pool = require('../util/db.js');
router.get('/status', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/status.html'));
});

router.get('/api/status', (req, res) => {
    const query = 'SELECT * FROM users WHERE user_id = ?';
    pool.query(query, [req.session.user.user_id], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});


router.put('/api/status/:stat/:new_value', (req, res) => {

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

module.exports = router;