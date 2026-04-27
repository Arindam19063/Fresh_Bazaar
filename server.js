const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'fresh_bazaar_secret_key';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Configuration for Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Upload Route ---
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

// --- Authentication Routes ---

// Register
app.post('/api/auth/register', (req, res) => {
    const { name, phone, password, address } = req.body;
    const data = db.read();

    if (data.users.find(u => u.phone === phone)) {
        return res.status(400).json({ error: 'Phone number already exists' });
    }

    const newUser = {
        id: Date.now(),
        name,
        phone,
        password: bcrypt.hashSync(password, 10),
        address,
        created_at: new Date().toISOString()
    };

    data.users.push(newUser);
    db.write(data);
    res.status(201).json({ id: newUser.id, message: 'User registered' });
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body;
    const data = db.read();
    const user = data.users.find(u => u.phone === phone);

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ id: user.id, name: user.name }, SECRET_KEY, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, name: user.name, phone: user.phone } });
    } else {
        res.status(401).json({ error: 'Invalid phone or password' });
    }
});

// --- Product Routes ---

// Get all products
app.get('/api/products', (req, res) => {
    const data = db.read();
    const formattedProducts = data.products.map(p => ({
        id: p.id,
        en: p.en_name,
        bn: p.bn_name,
        category: p.category,
        price: p.price,
        unit: p.unit,
        img: p.img,
        stock: p.stock === 1
    }));
    res.json(formattedProducts);
});

// Add new product (Admin)
app.post('/api/products', (req, res) => {
    const { en_name, bn_name, category, price, unit, img } = req.body;
    const data = db.read();

    const newProduct = {
        id: Date.now(),
        en_name,
        bn_name,
        category,
        price: parseFloat(price),
        unit,
        img: img || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
        stock: 1
    };

    data.products.push(newProduct);
    db.write(data);
    res.status(201).json(newProduct);
});

// Update product stock/price
app.put('/api/products/:id', (req, res) => {
    const data = db.read();
    const index = data.products.findIndex(p => p.id == req.params.id);
    
    if (index !== -1) {
        data.products[index] = { ...data.products[index], ...req.body };
        db.write(data);
        res.json(data.products[index]);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    const data = db.read();
    data.products = data.products.filter(p => p.id != req.params.id);
    db.write(data);
    res.json({ message: 'Product deleted' });
});

// --- Order Routes ---

// Place Order
app.post('/api/orders', (req, res) => {
    const { userId, items, totalPrice, address, paymentMethod, transactionId } = req.body;
    const data = db.read();

    const orderId = Date.now();
    const newOrder = {
        id: orderId,
        user_id: userId,
        total_price: totalPrice,
        status: 'pending',
        address,
        created_at: new Date().toISOString(),
        items: items.map(item => ({
            product_id: item.id,
            quantity: item.qty,
            price: item.price
        }))
    };

    const newPayment = {
        id: Date.now() + 1,
        order_id: orderId,
        amount: totalPrice,
        method: paymentMethod,
        status: 'completed',
        transaction_id: transactionId,
        created_at: new Date().toISOString()
    };

    data.orders.push(newOrder);
    data.payments.push(newPayment);
    db.write(data);

    res.status(201).json({ orderId, message: 'Order placed successfully' });
});

// Get user orders
app.get('/api/orders/:userId', (req, res) => {
    const data = db.read();
    const userOrders = data.orders.filter(o => o.user_id == req.params.userId);
    res.json(userOrders);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
