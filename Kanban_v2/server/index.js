require('dotenv').config();
const express = require('express');
const cors = require('cors');
const setupDb = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database
let db;
setupDb().then(database => {
    db = database;
    app.set('db', db);
    
    // Start Server
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
});

// Basic Route
app.get('/', (req, res) => {
    res.send('ZenTask API is running');
});

// Import Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
