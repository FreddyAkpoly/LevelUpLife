const express = require("express");
const router = express.Router();
const path = require('path');
const pool = require('../util/db.js');
const quest_id = new Date().getDate() + parseInt(process.env.OFFSET);

router.get('/', (req, res) => { 

    if (req.session.user) {
        res.sendFile(path.join(__dirname, '../../public/html/quests.html'));
    }
    else {
        res.sendFile(path.join(__dirname, '../../public/html/main.html'));
    }

});

router.get('/api/quests', (req, res) => {

    function getQuestById(id, callback) {
        const query = 'SELECT * FROM quest_list WHERE quest_id = ?';
        pool.query(query, [id], (err, results) => {
            if (err) return callback(err, null);
            if (results.length === 0) return callback(null, null);
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
                return tryFetchQuest(id + 1);
            }

            res.json(quest);
        });
    }

    tryFetchQuest(quest_id);
});

router.get('/api/quest_status', (req, res) => {

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

            return res.json({ completed: false });
        }

        res.json({ completed: !!results[0].is_completed });
    });
});

router.put('/api/quest_status/complete_quest', (req, res) => {


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

router.put('/api/quest_status/complete_quest', (req, res) => {


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

module.exports = router;