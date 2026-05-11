const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function setupDb() {
    const db = await open({
        filename: path.join(__dirname, 'zentask.db'),
        driver: sqlite3.Database
    });

    // Create Users Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT,
            avatar TEXT
        )
    `);

    // Create Tasks Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            description TEXT,
            due_date TEXT,
            priority TEXT DEFAULT 'medium',
            status TEXT DEFAULT 'todo',
            category TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `);

    // Create Tags Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `);

    // Task Tags Table (Many-to-Many)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS task_tags (
            task_id INTEGER,
            tag_id INTEGER,
            PRIMARY KEY (task_id, tag_id),
            FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
        )
    `);

    console.log('Database and tables created successfully.');
    return db;
}

module.exports = setupDb;
