const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const db = req.app.get('db');
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run(
            'INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, defaultAvatar]
        );
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'User already exists or invalid data' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const db = req.app.get('db');

    try {
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
