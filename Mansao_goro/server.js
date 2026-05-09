const express = require('express');
const cors = require('cors');
const path = require('path');
const { products: initialProducts } = require('./data');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// In-memory "database"
let products = [...initialProducts];
let users = [];
let orders = [];
let nextUserId = 1;
let nextOrderId = 1;

// API Endpoints
app.get('/api/products', (req, res) => {
    res.json(products);
});

app.post('/api/products', (req, res) => {
    const product = { id: products.length + 1, ...req.body };
    products.push(product);
    res.status(201).json(product);
});

app.put('/api/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id == req.params.id);
    if (index !== -1) {
        products[index] = { ...products[index], ...req.body };
        res.json({ message: 'Product updated' });
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    products = products.filter(p => p.id != req.params.id);
    res.json({ message: 'Product deleted' });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });
    res.json({ 
        message: "Login successful", 
        user: { id: user.id, name: user.name, email: user.email, address: user.address, phone: user.phone } 
    });
});

app.get('/api/orders/:email', (req, res) => {
    const userOrders = orders
        .filter(o => o.customer_email === req.params.email)
        .map(o => ({
            ...o,
            items_summary: o.items.map(i => `${i.name} (x${i.quantity})`).join(', ')
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(userOrders);
});

app.post('/api/orders', (req, res) => {
    const { customer_name, customer_email, items, total } = req.body;
    const newOrder = {
        id: nextOrderId++,
        customer_name,
        customer_email,
        items,
        total,
        status: 'PENDING',
        created_at: new Date().toISOString()
    };
    orders.push(newOrder);
    res.status(201).json({ id: newOrder.id, message: 'Order placed successfully' });
});

app.post('/api/signup', (req, res) => {
    const { name, email, password, phone, zip, address, number, complement, city, state } = req.body;
    
    if (users.some(u => u.email === email)) {
        return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const newUser = {
        id: nextUserId++,
        name, email, password, phone, zip, address, number, complement, city, state,
        created_at: new Date().toISOString()
    };
    users.push(newUser);
    res.status(201).json({ id: newUser.id, message: 'Usuário cadastrado com sucesso' });
});

app.put('/api/users/:email', (req, res) => {
    const index = users.findIndex(u => u.email === req.params.email);
    if (index !== -1) {
        users[index] = { ...users[index], ...req.body };
        res.json({ message: 'Profile updated' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Local dev server
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

// Export for Vercel
module.exports = app;
