const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get all tasks for user with tags
router.get('/', auth, async (req, res) => {
    const db = req.app.get('db');
    try {
        const tasks = await db.all(`
            SELECT t.*, GROUP_CONCAT(tags.name) as tags 
            FROM tasks t 
            LEFT JOIN task_tags tt ON t.id = tt.task_id 
            LEFT JOIN tags ON tt.tag_id = tags.id 
            WHERE t.user_id = ? 
            GROUP BY t.id 
            ORDER BY t.created_at DESC
        `, [req.user.id]);
        
        // Convert tags string to array
        const tasksWithArrayTags = tasks.map(task => ({
            ...task,
            tags: task.tags ? task.tags.split(',') : []
        }));
        
        res.json(tasksWithArrayTags);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create task with tags
router.post('/', auth, async (req, res) => {
    const { title, description, due_date, priority, category, tags } = req.body;
    const db = req.app.get('db');
    try {
        const result = await db.run(
            'INSERT INTO tasks (user_id, title, description, due_date, priority, category) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, title, description, due_date, priority, category]
        );
        const taskId = result.lastID;

        // Handle tags
        if (tags && Array.isArray(tags)) {
            for (const tagName of tags) {
                let tag = await db.get('SELECT id FROM tags WHERE name = ? AND user_id = ?', [tagName, req.user.id]);
                if (!tag) {
                    const tagResult = await db.run('INSERT INTO tags (name, user_id) VALUES (?, ?)', [tagName, req.user.id]);
                    tag = { id: tagResult.lastID };
                }
                await db.run('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)', [taskId, tag.id]);
            }
        }

        const newTask = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
        res.status(201).json(newTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update task with tags
router.put('/:id', auth, async (req, res) => {
    const { title, description, due_date, priority, status, category, tags } = req.body;
    const db = req.app.get('db');
    try {
        await db.run(
            'UPDATE tasks SET title = ?, description = ?, due_date = ?, priority = ?, status = ?, category = ? WHERE id = ? AND user_id = ?',
            [title, description, due_date, priority, status, category, req.params.id, req.user.id]
        );

        // Handle tags (Sync)
        if (tags && Array.isArray(tags)) {
            // Remove old links
            await db.run('DELETE FROM task_tags WHERE task_id = ?', [req.params.id]);
            
            for (const tagName of tags) {
                let tag = await db.get('SELECT id FROM tags WHERE name = ? AND user_id = ?', [tagName, req.user.id]);
                if (!tag) {
                    const tagResult = await db.run('INSERT INTO tags (name, user_id) VALUES (?, ?)', [tagName, req.user.id]);
                    tag = { id: tagResult.lastID };
                }
                await db.run('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)', [req.params.id, tag.id]);
            }
        }

        const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
    const db = req.app.get('db');
    try {
        await db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Stats for Dashboard
router.get('/stats', auth, async (req, res) => {
    const db = req.app.get('db');
    const today = new Date().toISOString().split('T')[0];
    try {
        const total = await db.get('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?', [req.user.id]);
        const completedToday = await db.get(
            "SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'done' AND date(due_date) = ?", 
            [req.user.id, today]
        );
        const overdue = await db.get(
            "SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status != 'done' AND due_date < ?", 
            [req.user.id, today]
        );
        const pending = await db.get(
            "SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status != 'done'", 
            [req.user.id]
        );

        res.json({
            total: total.count,
            completedToday: completedToday.count,
            overdue: overdue.count,
            pending: pending.count
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
