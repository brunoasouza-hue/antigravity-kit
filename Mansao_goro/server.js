const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Database setup
const db = new sqlite3.Database('./mansao_goro.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Create products table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            image TEXT,
            category TEXT
        )`);

        // Create orders table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT,
            customer_email TEXT,
            total REAL,
            status TEXT DEFAULT 'PENDING',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create order_items table
        db.run(`CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            quantity INTEGER,
            price REAL,
            FOREIGN KEY (order_id) REFERENCES orders (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )`);

        // Create users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            zip TEXT,
            address TEXT,
            number TEXT,
            complement TEXT,
            city TEXT,
            state TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Seed products if empty
        db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
            if (row.count === 0) {
                const products = [
                    {
                        name: 'Tropical Haze',
                        price: 42.00,
                        description: 'Abacaxi grelhado, hortelã fresca e notas de coco. Hidratação profunda para noites infinitas.',
                        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2bY3XYEaghqT5RS4tfBotEYZXhYxBO8Tvo_MYM3At6SDzODsA8Po_9W-_QYnpUPNmZk59Pdj-4GPJc27z53l5p1MFGmTrldnFNBnYQ5ba8rvPlNnSv0t7u6I-37Pg2xpMhlnLDc5D25yBdwO5kUmyrdVPvJezGGfyCLznuyBtI7fd053z86NG4xpEEzAtQygaCblvBer7YL-M_b3nW_Flx_vRuQJyOAz7Rlwy6v7uzBMOjbEPZlEVpz8QA_tK9e6i6cnkJRuWh-U',
                        category: 'BEBIDAS'
                    },
                    {
                        name: 'Electric Violet',
                        price: 38.00,
                        description: 'Mirtilo, lavanda e um toque cítrico de limão siciliano. O equilíbrio perfeito entre foco e relaxamento.',
                        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq5fHrumVp7_XZ5ua07NMvhd_suwzJZowWGtR_jTZcoIWgNC6qAUf2wQw1Xjee_NL8KLst4X5ynzDvMLeDv4ZBVyYVbOiIBTP1G43iUThYrMKTGp5sBmCHpIyaPfHmGcO869U7Pn8aLqIgC5bl1FSCk8sEuDeHjIDBifU8MC1Qc6CTuyiJhbEZw_DXfB3PTvr1YJVkq6tbvtg6GKtjbHnWeMQNkCMbcuklWy_FNRRWdIqcgmIC6BHackFLe7-PK1QEe4fLX6UTYhg',
                        category: 'BEBIDAS'
                    },
                    {
                        name: 'Golden Hour',
                        price: 45.00,
                        description: 'Pêssego maduro, gengibre picante e camomila. Ritual sensorial para encerrar o dia com autoridade.',
                        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqNAtsUU6JG5Voyt4udeWFb7JsWb-kN4z-enmeLfzUKipCo00XsS9sVSuvZP33j9McE1wmBL4TSvNGMkTQgy6i3tm0V6JIa4_JSiseu9JhYvW0tkC6iP-uzDXnBg72mUxAYXA9aMFuiLQ0YcPY78lEA9mB1liwH_ULo8_UWUmcfH73AXRRwt1qoz_MhwEBM9IYq3GxX9PO9mBq7nAb8SeBWgC2PQ3TqTRqFtW8Ws28fvBXbIXZZjAa9DLLCqyIXZPknxqsFtE8ASA',
                        category: 'BEBIDAS'
                    },
                    {
                        name: 'Master Ritual Set',
                        price: 158.00,
                        description: 'A experiência completa da mansão em uma curadoria exclusiva.',
                        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2eU5EPLqO_Q3GKJR_-JzzibUDvoplWnAA_3r1p6lQ7O1Wlu4j7JDCIQUN6Ha7gPwgRu_Da-dz5Xu9KAu1DNyl4RHLaRvcFOyiuP_MkGvlPEXas1xiBvZL9JvtUaHzd9RCy4kSBV0rE1HyG-xgf4LOBkLF5fJG6oqvkbns27EhCEEvRd7hcp_5rUszOv_WP1oDTO81FamwUOoaVHIqE9I_nAKnMME_FBVGGUUTxL0VZfZ4kV0XHVWEF76DZFX21hmJv3vxuUQhMjo',
                        category: 'KITS'
                    },
                    {
                        name: 'Midnight Tonic',
                        price: 38.00,
                        description: 'Tônica artesanal, botânicos amargos e zest de toranja. Performance líquida para foco absoluto.',
                        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKbdraosTL5dmnzaozu2GLcbd7GnKJsVJFLSBuSu79bAfskl9cndHa7X5KbSmP-FHI7mPHQK6mj27_ahoouULF80ZW7-DH5yk5lcRE02EU38aWMkKqUY-R_M-0U1bOy2zgDduYZ-Q0v-U0uDD3cIR90GuaDnVeEUB3p5JnXBvD-hde6DE1kkgnZwHVQgIT9-Ikie0gvM_H0U4aAStRDCzDTkuLiHW7wewQzlUB55SzvmNCwRgIu63qzK6M9JHhzlvVndu6SGqHfxQ',
                        category: 'BEBIDAS'
                    }
                ];

                const stmt = db.prepare("INSERT INTO products (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)");
                products.forEach(p => stmt.run(p.name, p.price, p.description, p.image, p.category));
                stmt.finalize();
                console.log('Database seeded with products.');
            }
        });
    });
}

// API Endpoints
// Get all products
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add new product
app.post('/api/products', (req, res) => {
    const { name, price, description, image, category } = req.body;
    db.run(`INSERT INTO products (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)`,
    [name, price, description, image, category],
    function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID });
    });
});

// Update product
app.put('/api/products/:id', (req, res) => {
    const { name, price, description, image, category } = req.body;
    db.run(`UPDATE products SET name = ?, price = ?, description = ?, image = ?, category = ? WHERE id = ?`,
    [name, price, description, image, category, req.params.id],
    function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product updated' });
    });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    db.run(`DELETE FROM products WHERE id = ?`, req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product deleted' });
    });
});

// User Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: "Credenciais inválidas" });
        res.json({ message: "Login successful", user: { id: user.id, name: user.name, email: user.email, address: user.address, phone: user.phone } });
    });
});

// Get order history for a user
app.get('/api/orders/:email', (req, res) => {
    db.all(`SELECT o.*, GROUP_CONCAT(p.name || ' (x' || oi.quantity || ')') as items_summary 
            FROM orders o 
            JOIN order_items oi ON o.id = oi.order_id 
            JOIN products p ON oi.product_id = p.id 
            WHERE o.customer_email = ? 
            GROUP BY o.id 
            ORDER BY o.created_at DESC`, [req.params.email], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/orders', (req, res) => {
    const { customer_name, customer_email, items, total } = req.body;
    
    db.run(`INSERT INTO orders (customer_name, customer_email, total) VALUES (?, ?, ?)`, 
    [customer_name, customer_email, total], 
    function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        const orderId = this.lastID;
        const stmt = db.prepare(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`);
        
        items.forEach(item => {
            stmt.run(orderId, item.id, item.quantity, item.price);
        });
        
        stmt.finalize();
        res.status(201).json({ id: orderId, message: 'Order placed successfully' });
    });
});

app.post('/api/signup', (req, res) => {
    const { name, email, password, phone, zip, address, number, complement, city, state } = req.body;
    
    db.run(`INSERT INTO users (name, email, password, phone, zip, address, number, complement, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [name, email, password, phone, zip, address, number, complement, city, state], 
    function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ error: 'E-mail já cadastrado' });
            } else {
                res.status(500).json({ error: err.message });
            }
            return;
        }
        res.status(201).json({ id: this.lastID, message: 'Usuário cadastrado com sucesso' });
    });
});

// Update user profile
app.put('/api/users/:email', (req, res) => {
    const { name, phone, zip, address, number, complement, city, state } = req.body;
    db.run(`UPDATE users SET name = ?, phone = ?, zip = ?, address = ?, number = ?, complement = ?, city = ?, state = ? WHERE email = ?`,
    [name, phone, zip, address, number, complement, city, state, req.params.email],
    function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profile updated' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
